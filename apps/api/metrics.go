package main

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	ordersTotal = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "brewrelay_orders_total",
		Help: "Total de pedidos creados.",
	})
	notificationsTotal = prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "brewrelay_notifications_total",
		Help: "Total de notificaciones del barista (consulta a la DB).",
	})
	ordersByStatus = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "brewrelay_orders_by_status",
		Help: "Pedidos agrupados por estado.",
	}, []string{"status"})
)

func init() {
	prometheus.MustRegister(ordersTotal, notificationsTotal, ordersByStatus)
}

// metricsHandler expone /metrics para Prometheus.
// Antes de cada scrape, actualiza los gauges que vienen de la DB.
func metricsHandler(db *sql.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c := &dbCollector{db: db}
		c.update()
		promhttp.Handler().ServeHTTP(w, r)
	})
}

type dbCollector struct {
	db *sql.DB
}

func (c *dbCollector) update() {
	if c.db == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	var n int
	if err := c.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM barista_notifications`).Scan(&n); err == nil {
		notificationsTotal.Set(float64(n))
	}

	rows, err := c.db.QueryContext(ctx, `SELECT status, COUNT(*) FROM coffee_orders GROUP BY status`)
	if err != nil {
		return
	}
	defer rows.Close()
	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err == nil {
			ordersByStatus.WithLabelValues(status).Set(float64(count))
		}
	}
}