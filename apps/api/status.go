package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

// Transiciones de estado válidas del pedido.
var nextStatus = map[string]string{
	"CREATED":    "PREPARING",
	"PREPARING":  "READY",
	"READY":      "DELIVERED",
	"DELIVERED":  "",
}

type updateStatusRequest struct {
	Status string `json:"status"`
}

// handleOrder despacha sub-rutas bajo /orders/{id}/status
// Soporta: PATCH /orders/{id}/status  { "status": "PREPARING" }
func (a *api) handleOrder(w http.ResponseWriter, r *http.Request) {
	// path = /orders/{id}/status
	// parts: ["orders", "{id}", "status"]
	path := strings.TrimPrefix(r.URL.Path, "/")
	parts := strings.Split(path, "/")
	if len(parts) != 3 || parts[2] != "status" {
		http.NotFound(w, r)
		return
	}

	orderID, err := uuid.Parse(parts[1])
	if err != nil {
		http.Error(w, "invalid order id", http.StatusBadRequest)
		return
	}

	if r.Method != http.MethodPatch {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req updateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	// Validar transición
	var currentStatus string
	err = a.db.QueryRow(`SELECT status FROM coffee_orders WHERE id = $1`, orderID).Scan(&currentStatus)
	if err == sql.ErrNoRows {
		http.Error(w, "order not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "db error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	expected, ok := nextStatus[currentStatus]
	if !ok {
		http.Error(w, "current status '"+currentStatus+"' has no transitions", http.StatusBadRequest)
		return
	}
	if req.Status != expected {
		http.Error(w, "invalid transition: from '"+currentStatus+"' to '"+req.Status+"' (expected '"+expected+"')", http.StatusBadRequest)
		return
	}

	_, err = a.db.Exec(`UPDATE coffee_orders SET status = $1 WHERE id = $2`, req.Status, orderID)
	if err != nil {
		http.Error(w, "update failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"id":     orderID,
		"status": req.Status,
	})
}