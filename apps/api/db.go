package main

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

func connectDB() (*sql.DB, error) {
	host := getEnv("PGHOST", "postgres")
	port := getEnv("PGPORT", "5432")
	user := getEnv("PGUSER", "brewrelay")
	password := getEnv("PGPASSWORD", "brewrelay")
	dbname := getEnv("PGDATABASE", "brewrelay")
	sslmode := getEnv("PGSSLMODE", "disable")

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	return db, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
