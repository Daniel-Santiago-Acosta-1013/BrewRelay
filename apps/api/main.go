package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type api struct {
	db *sql.DB
}

func main() {
	db, err := connectDB()
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer db.Close()

	a := &api{db: db}

	mux := http.NewServeMux()
	mux.HandleFunc("/orders", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			a.createOrder(w, r)
		case http.MethodGet:
			a.listOrders(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/orders/", a.handleOrder) // /orders/{id}/status
	mux.HandleFunc("/barista-notifications", a.listBaristaNotifications)
	mux.HandleFunc("/menu", a.handleMenu)
	mux.Handle("/metrics", metricsHandler(a.db))
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	addr := getEnv("HTTP_ADDR", ":8080")
	log.Printf("BrewRelay API listening on %s", addr)
	if err := http.ListenAndServe(addr, cors(mux)); err != nil {
		log.Fatalf("server: %v", err)
	}
}

// cors habilita CORS para que el frontend (CloudFront / localhost) pueda llamar a la API.
func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", getEnv("CORS_ORIGIN", "*"))
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func main_env() string { return os.Getenv("ENV") }
