package main

import (
    "database/sql"
    "fmt"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/gin-gonic/gin"
    _ "github.com/lib/pq" // PostgreSQL driver
    "github.com/joho/godotenv"
)

type JSONDate struct {
    time.Time
}

type TemperatureData struct {
    Time     sql.NullTime `json:"time"`
    Latitude sql.NullFloat64 `json:"latitude"`
    Longitude sql.NullFloat64 `json:"longitude"`
    T2mMin   sql.NullFloat64 `json:"t2m_min"`
    T2mMean  sql.NullFloat64 `json:"t2m_mean"`
    T2mMax   sql.NullFloat64 `json:"t2m_max"`
}

func getTempData(c *gin.Context) {
    lat := c.Query("lat")
    long := c.Query("long")
    date := c.Query("date")

    // Check if all parameters are empty
    if lat == "" && long == "" && date == "" {
        c.JSON(http.StatusBadRequest, gin.H{"message": "No parameters provided. Please provide lat, long, or date."})
        return
    }

    connStr := fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=require",
        os.Getenv("DB_USER"),
        os.Getenv("DB_PASSWORD"),
        os.Getenv("DB_NAME"),
        os.Getenv("DB_HOST"),
        os.Getenv("DB_PORT"),
    )
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    var sqlStatement string
    var rows *sql.Rows

    // Adjust the SQL query based on the provided parameters
    if lat != "" && long != "" && date != "" {
        // Fetch data for specific latitude, longitude, and date
        sqlStatement = `SELECT time, latitude, longitude, t2m_min, t2m_mean, t2m_max 
                        FROM era5_refined 
                    WHERE latitude = $1 AND longitude = $2 AND DATE(time) = $3`
        rows, err = db.Query(sqlStatement, lat, long, date)
    }

    if err != nil {
        log.Printf("Query failed: %v; SQL Statement: %s\n", err, sqlStatement)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed", "details": err.Error()})
        return
    }
    defer rows.Close()

    var temps []TemperatureData
    for rows.Next() {
        var temp TemperatureData
        if err := rows.Scan(&temp.Time, &temp.Latitude, &temp.Longitude, &temp.T2mMin, &temp.T2mMean, &temp.T2mMax); err != nil {
            log.Printf("Failed to scan row: %v\n", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to scan row", "details": err.Error()})
            return
        }
        temps = append(temps, temp)
    }

    if err = rows.Err(); err != nil {
        log.Printf("Error iterating rows: %v\n", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "error iterating rows"})
        return
    }
    // Send the result back
    c.JSON(http.StatusOK, temps)
}


func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS")

        // Handle preflight requests
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }

        c.Next()
    }
}

func main() {
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    router := gin.Default()

    // Apply the CORS middleware to the router
    router.Use(CORSMiddleware())

    // Setup the route for your API
    router.GET("/api/climate/", getTempData)

    // Start the server on port 4000
    err := router.Run(":4000")
    if err != nil {
        log.Fatal("Error starting the server: ", err)
    }
}