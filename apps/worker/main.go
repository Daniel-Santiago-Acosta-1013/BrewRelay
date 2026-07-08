package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/segmentio/kafka-go"
)

// orderPayload es el contenido del campo payload de outbox_events.
type orderPayload struct {
	OrderID      string `json:"orderId"`
	CustomerName string `json:"customerName"`
	Drink        string `json:"drink"`
	Size         string `json:"size"`
	Quantity     int    `json:"quantity"`
	Status       string `json:"status"`
}

// kafkaValue es la forma en que Debezium (Outbox EventRouter) publica el mensaje.
type kafkaValue struct {
	Payload       orderPayload `json:"payload"`
	EventType     string       `json:"eventType"`
	AggregateType string       `json:"aggregateType"`
	AggregateID   string       `json:"aggregateId"`
}

func main() {
	db, err := connectDB()
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer db.Close()

	// Servidor de métricas Prometheus
	metricsAddr := getEnv("METRICS_ADDR", ":8081")
	startMetricsServer(metricsAddr)
	log.Printf("Worker metrics en %s/metrics", metricsAddr)

	brokers := getEnv("KAFKA_BROKERS", "kafka:9092")
	topic := getEnv("KAFKA_TOPIC", "coffee.orders")
	group := getEnv("KAFKA_GROUP", "barista-worker")

	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  []string{brokers},
		Topic:    topic,
		GroupID:  group,
		MinBytes: 1,
		MaxBytes: 10 << 20,
		CommitInterval: 0, // commit síncrono tras procesar
	})
	defer r.Close()

	log.Printf("Barista Service escuchando topic=%s brokers=%s", topic, brokers)

	for {
		m, err := r.ReadMessage(context.Background())
		if err != nil {
			log.Printf("read error: %v", err)
			workerErrors.WithLabelValues("read_error").Inc()
			time.Sleep(2 * time.Second)
			continue
		}
		start := time.Now()
		if err := process(db, m.Value); err != nil {
			log.Printf("process error: %v", err)
			workerErrors.WithLabelValues("process_error").Inc()
			continue
		}
		workerProcessingDuration.Observe(time.Since(start).Seconds())
		workerMessagesProcessed.Inc()
		if err := r.CommitMessages(context.Background(), m); err != nil {
			log.Printf("commit error: %v", err)
			workerErrors.WithLabelValues("commit_error").Inc()
		}
	}
}

// process parsea el evento OrderCreated y guarda una notificación.
func process(db *sql.DB, value []byte) error {
	var kv kafkaValue
	if err := json.Unmarshal(value, &kv); err != nil {
		return fmt.Errorf("unmarshal: %w", err)
	}
	if kv.EventType != "OrderCreated" {
		log.Printf("evento ignorado (tipo=%s)", kv.EventType)
		return nil
	}

	p := kv.Payload
	message := fmt.Sprintf("Nuevo pedido recibido: %s %s x%d para %s",
		p.Drink, p.Size, p.Quantity, p.CustomerName)

	orderID := p.OrderID
	if orderID == "" {
		orderID = kv.AggregateID
	}

	_, err := db.Exec(
		`INSERT INTO barista_notifications (id, order_id, message, received_at)
		 VALUES ($1, $2, $3, $4)`,
		uuid.New(), orderID, message, time.Now().UTC(),
	)
	if err != nil {
		return fmt.Errorf("insert notification: %w", err)
	}
	log.Printf("notificación guardada: %s", message)
	return nil
}