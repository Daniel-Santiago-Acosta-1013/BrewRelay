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
	"CREATED":   "PREPARING",
	"PREPARING": "READY",
	"READY":     "DELIVERED",
	"DELIVERED": "",
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
		writeError(w, r, a.db, http.StatusBadRequest, ErrorBadRequest, "invalid order id")
		return
	}

	if r.Method != http.MethodPatch {
		writeError(w, r, a.db, http.StatusMethodNotAllowed, ErrorMethodNotAllowed, "method not allowed")
		return
	}

	var req updateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, r, a.db, http.StatusBadRequest, ErrorBadRequest, "invalid body")
		return
	}

	// Validar transición
	var currentStatus string
	err = a.db.QueryRow(`SELECT status FROM coffee_orders WHERE id = $1`, orderID).Scan(&currentStatus)
	if err == sql.ErrNoRows {
		writeError(w, r, a.db, http.StatusNotFound, ErrorNotFound, "order not found")
		return
	}
	if err != nil {
		writeError(w, r, a.db, http.StatusInternalServerError, ErrorDB, "db error: "+err.Error())
		return
	}

	expected, ok := nextStatus[currentStatus]
	if !ok {
		writeError(w, r, a.db, http.StatusBadRequest, ErrorBadRequest, "current status '"+currentStatus+"' has no transitions")
		return
	}
	if req.Status != expected {
		writeError(w, r, a.db, http.StatusBadRequest, ErrorBadRequest, "invalid transition: from '"+currentStatus+"' to '"+req.Status+"' (expected '"+expected+"')")
		return
	}

	_, err = a.db.Exec(`UPDATE coffee_orders SET status = $1 WHERE id = $2`, req.Status, orderID)
	if err != nil {
		writeError(w, r, a.db, http.StatusInternalServerError, ErrorDB, "update failed: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"id":     orderID,
		"status": req.Status,
	})
}