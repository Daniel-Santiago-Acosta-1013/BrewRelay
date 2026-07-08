package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

// Order representa una fila de coffee_orders.
type Order struct {
	ID           uuid.UUID `json:"id"`
	CustomerName string    `json:"customerName"`
	Drink        string    `json:"drink"`
	Size         string    `json:"size"`
	Quantity     int       `json:"quantity"`
	Total        float64   `json:"total"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"createdAt"`
}

type createOrderRequest struct {
	CustomerName string `json:"customerName"`
	Drink        string `json:"drink"`
	Size         string `json:"size"`
	Quantity     int    `json:"quantity"`
}

// createOrder inserta el pedido y el evento outbox en la MISMA transacción.
func (a *api) createOrder(w http.ResponseWriter, r *http.Request) {
	var req createOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, r, a.db, http.StatusBadRequest, ErrorBadRequest, "invalid body")
		return
	}
	if req.CustomerName == "" || req.Drink == "" || req.Size == "" || req.Quantity <= 0 {
		writeError(w, r, a.db, http.StatusBadRequest, ErrorBadRequest, "customerName, drink, size and quantity>0 are required")
		return
	}

	orderID := uuid.New()
	eventID := uuid.New()
	now := time.Now().UTC()
	total := priceFor(req.Drink, req.Size) * float64(req.Quantity)

	payload := map[string]interface{}{
		"orderId":      orderID.String(),
		"customerName": req.CustomerName,
		"drink":        req.Drink,
		"size":         req.Size,
		"quantity":     req.Quantity,
		"total":        total,
		"status":       "CREATED",
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		writeError(w, r, a.db, http.StatusInternalServerError, ErrorMarshal, "marshal error")
		return
	}

	tx, err := a.db.Begin()
	if err != nil {
		writeError(w, r, a.db, http.StatusInternalServerError, ErrorDB, "db begin error")
		return
	}
	defer tx.Rollback()

	_, err = tx.Exec(`
		INSERT INTO coffee_orders (id, customer_name, drink, size, quantity, total, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, 'CREATED', $7)`,
		orderID, req.CustomerName, req.Drink, req.Size, req.Quantity, total, now,
	)
	if err != nil {
		writeError(w, r, a.db, http.StatusInternalServerError, ErrorDB, "insert order failed: "+err.Error())
		return
	}

	_, err = tx.Exec(`
		INSERT INTO outbox_events (id, aggregatetype, aggregateid, type, payload, created_at)
		VALUES ($1, 'CoffeeOrder', $2, 'OrderCreated', $3, $4)`,
		eventID, orderID, payloadBytes, now,
	)
	if err != nil {
		writeError(w, r, a.db, http.StatusInternalServerError, ErrorDB, "insert outbox failed: "+err.Error())
		return
	}

	if err := tx.Commit(); err != nil {
		writeError(w, r, a.db, http.StatusInternalServerError, ErrorDB, "commit failed: "+err.Error())
		return
	}

	ordersTotal.Inc()

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"id":           orderID,
		"customerName": req.CustomerName,
		"drink":        req.Drink,
		"size":         req.Size,
		"quantity":     req.Quantity,
		"total":        total,
		"status":       "CREATED",
		"createdAt":    now,
	})
}

func (a *api) listOrders(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.Query(`
		SELECT id, customer_name, drink, size, quantity, total, status, created_at
		FROM coffee_orders ORDER BY created_at DESC`)
	if err != nil {
		writeError(w, r, a.db, http.StatusInternalServerError, ErrorDB, "query error: "+err.Error())
		return
	}
	defer rows.Close()

	orders := []Order{}
	for rows.Next() {
		var o Order
		if err := rows.Scan(&o.ID, &o.CustomerName, &o.Drink, &o.Size, &o.Quantity, &o.Total, &o.Status, &o.CreatedAt); err != nil {
			writeError(w, r, a.db, http.StatusInternalServerError, ErrorDB, "scan error: "+err.Error())
			return
		}
		orders = append(orders, o)
	}
	writeJSON(w, http.StatusOK, orders)
}
