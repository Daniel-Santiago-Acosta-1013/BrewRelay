package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
)

// ErrorType categoriza los tipos de error de la API.
type ErrorType string

const (
	ErrorBadRequest     ErrorType = "bad_request"
	ErrorNotFound       ErrorType = "not_found"
	ErrorMethodNotAllowed ErrorType = "method_not_allowed"
	ErrorDB             ErrorType = "db_error"
	ErrorMarshal         ErrorType = "marshal_error"
	ErrorInternal        ErrorType = "internal_error"
)

// writeError loguea el error en JSON, registra la métrica y responde al cliente.
func writeError(w http.ResponseWriter, r *http.Request, db *sql.DB, code int, errorType ErrorType, message string) {
	// Logging estructurado en JSON
	logEntry := map[string]interface{}{
		"timestamp":  time.Now().UTC().Format(time.RFC3339),
		"level":      "error",
		"method":     r.Method,
		"path":       r.URL.Path,
		"status":     code,
		"error_type": string(errorType),
		"message":    message,
	}
	logBytes, _ := json.Marshal(logEntry)
	log.Println(string(logBytes))

	// Métrica
	httpErrorsTotal.WithLabelValues(r.Method, r.URL.Path, strconv.Itoa(code), string(errorType)).Inc()

	// INSERT best-effort en api_errors
	if db != nil {
		go func() {
			_, _ = db.Exec(
				`INSERT INTO api_errors (id, method, path, status, error_type, message, created_at)
				 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
				uuid.New(), r.Method, r.URL.Path, code, string(errorType), message, time.Now().UTC(),
			)
		}()
	}

	// Respuesta al cliente
	http.Error(w, message, code)
}

// writeErrorf es writeError con fmt.Sprintf.
func writeErrorf(w http.ResponseWriter, r *http.Request, db *sql.DB, code int, errorType ErrorType, format string, args ...interface{}) {
	writeError(w, r, db, code, errorType, fmtSprintf(format, args...))
}

func fmtSprintf(format string, args ...interface{}) string {
	return format
}