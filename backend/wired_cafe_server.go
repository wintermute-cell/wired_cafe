package main

import (
    //"fmt"
    "os"
    "log"
    "net/http"
)

var (
    WarningLogger  *log.Logger
    InfoLogger     *log.Logger
    ErrorLogger    *log.Logger
)

func initLogging() {
    file, err := os.OpenFile(
        "wired_cafe_server.go",
        os.O_APPEND|os.O_CREATE|os.O_WRONLY,
        0666)
    if err != nil {
        log.Fatal(err)
    }

    InfoLogger = log.New(file, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
    WarningLogger = log.New(file, "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
    ErrorLogger = log.New(file, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)

    InfoLogger.Println("File logging initialized successfully.")
}

func logerr(err error, reason string) {
    if err != nil {
        ErrorLogger.Printf((reason + ": %v"), err)
    }
}

func heartbeatHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    jsonData := []byte(`{"status":"OK"}`)
    _, err := w.Write(jsonData)
    logerr(err, "Write failed")
}

func main() {
    initLogging()
    http.HandleFunc("/heartbeat", heartbeatHandler)
    log.Fatal(http.ListenAndServe(":8080", nil))
}
