package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello from the Go backend!")
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port for local development
	}

	http.HandleFunc("/api", helloHandler)

	log.Println("Starting server on port:" + port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
