package main

import (
	"net/http"
	"time"
)

// BaristaNotification representa una fila de barista_notifications.
type BaristaNotification struct {
	ID         string    `json:"id"`
	OrderID    string    `json:"orderId"`
	Message    string    `json:"message"`
	ReceivedAt time.Time `json:"receivedAt"`
}

func (a *api) listBaristaNotifications(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, r, a.db, http.StatusMethodNotAllowed, ErrorMethodNotAllowed, "method not allowed")
		return
	}
	rows, err := a.db.Query(`
		SELECT id, order_id, message, received_at
		FROM barista_notifications ORDER BY received_at DESC`)
	if err != nil {
		writeError(w, r, a.db, http.StatusInternalServerError, ErrorDB, "query error: "+err.Error())
		return
	}
	defer rows.Close()

	notifs := []BaristaNotification{}
	for rows.Next() {
		var n BaristaNotification
		if err := rows.Scan(&n.ID, &n.OrderID, &n.Message, &n.ReceivedAt); err != nil {
			writeError(w, r, a.db, http.StatusInternalServerError, ErrorDB, "scan error: "+err.Error())
			return
		}
		notifs = append(notifs, n)
	}
	writeJSON(w, http.StatusOK, notifs)
}