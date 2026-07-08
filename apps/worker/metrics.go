package main

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	workerMessagesProcessed = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "brewrelay_worker_messages_processed_total",
		Help: "Total de mensajes procesados por el worker.",
	})
	workerErrors = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "brewrelay_worker_errors_total",
		Help: "Total de errores del worker por tipo.",
	}, []string{"error_type"})
	workerProcessingDuration = prometheus.NewHistogram(prometheus.HistogramOpts{
		Name:    "brewrelay_worker_processing_duration_seconds",
		Help:   "Duración de procesamiento de cada mensaje.",
		Buckets: []float64{0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10},
	})
)

func init() {
	prometheus.MustRegister(workerMessagesProcessed, workerErrors, workerProcessingDuration)
}

// startMetricsServer inicia el servidor de métricas Prometheus en el puerto indicado.
func startMetricsServer(addr string) {
	http.Handle("/metrics", promhttp.Handler())
	go func() {
		_ = http.ListenAndServe(addr, nil)
	}()
}