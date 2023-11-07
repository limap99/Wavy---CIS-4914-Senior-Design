package main

import ( 
	"database/sql"
	
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/gin-contrib/cors"
	_ "github.com/lib/pq"
)

type JSONDate struct {
	time.Time
}

func (jd *JSONDate) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), "\"")
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return err
	}
	jd.Time = t
	return nil
}

type Era5Data struct {
	Time      time.Time       `json:"time"`
	Latitude  float64         `json:"latitude"`
	Longitude float64         `json:"longitude"`
	U10Min    sql.NullFloat64 `json:"u10_min,omitempty"` // using sql.NullFloat64 to handle NULLs
	U10Mean   sql.NullFloat64 `json:"u10_mean,omitempty"`
	U10Max    sql.NullFloat64 `json:"u10_max,omitempty"`
	V10Min    sql.NullFloat64 `json:"v10_min,omitempty"`
	V10Mean   sql.NullFloat64 `json:"v10_mean,omitempty"`
	V10Max    sql.NullFloat64 `json:"v10_max,omitempty"`
	D2mMin    sql.NullFloat64 `json:"d2m_min,omitempty"`
	D2mMean   sql.NullFloat64 `json:"d2m_mean,omitempty"`
	D2mMax    sql.NullFloat64 `json:"d2m_max,omitempty"`
	T2mMin    sql.NullFloat64 `json:"t2m_min,omitempty"`
	T2mMean   sql.NullFloat64 `json:"t2m_mean,omitempty"`
	T2mMax    sql.NullFloat64 `json:"t2m_max,omitempty"`
	TccMin    sql.NullFloat64 `json:"tcc_min,omitempty"`
	TccMean   sql.NullFloat64 `json:"tcc_mean,omitempty"`
	TccMax    sql.NullFloat64 `json:"tcc_max,omitempty"`
	MwdMean   sql.NullFloat64 `json:"mwd_mean,omitempty"`
	MwpMean   sql.NullFloat64 `json:"mwp_mean,omitempty"`
	SstMean   sql.NullFloat64 `json:"sst_mean,omitempty"`
	SwhMean   sql.NullFloat64 `json:"swh_mean,omitempty"`
	TpEod     sql.NullFloat64 `json:"tp_eod,omitempty"`
	//Geom      pq.Geometry     `json:"geom,omitempty"` // pq.Geometry is a placeholder, actual type depends on how you handle geometry types
}

type AverageTemperatureData struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	T2mMean   float64 `json:"t2m_mean"`
}

type ClimateMaxHighData struct {
	Lat                  float64 `json:"Lat"`
	Long                 float64 `json:"Long"`
	Max_Daily_High     float64 `json:"Max_Daily_High"`
}

type ClimateMinLowData struct {
	Lat                  float64 `json:"Lat"`
	Long                 float64 `json:"Long"`
	Min_Daily_Low     float64 `json:"Min_Daily_Low`
}

func getAllClimateData(c *gin.Context) {
    // Load environment variables from .env
    err := godotenv.Load()
    if err != nil {
        log.Printf("Error loading .env file: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error loading environment variables",
        })
        return
    }

    // Establish connection to the database
    connStr := os.Getenv("POSTGRES_CONNECTION_STRING")
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Printf("Error opening database: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error while connecting to the database",
        })
        return
    }
    defer db.Close()

    // Define the SQL query to select all columns from era5_data
    query := `
        SELECT 
            time, latitude, longitude, u10_min, u10_mean, u10_max,
            v10_min, v10_mean, v10_max, d2m_min, d2m_mean, d2m_max,
            t2m_min, t2m_mean, t2m_max, tcc_min, tcc_mean, tcc_max,
            mwd_mean, mwp_mean, sst_mean, swh_mean, tp_eod
        FROM 
            era5_data;
    `

    // Execute the query
    rows, err := db.Query(query)
    if err != nil {
        log.Printf("Error querying the database: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error while querying the database",
        })
        return
    }
    defer rows.Close()

    // Iterate over the rows and populate a slice of Era5Data
    var allData []Era5Data
    for rows.Next() {
        var data Era5Data
        err = rows.Scan(
            &data.Time, &data.Latitude, &data.Longitude, &data.U10Min, &data.U10Mean, &data.U10Max,
            &data.V10Min, &data.V10Mean, &data.V10Max, &data.D2mMin, &data.D2mMean, &data.D2mMax,
            &data.T2mMin, &data.T2mMean, &data.T2mMax, &data.TccMin, &data.TccMean, &data.TccMax,
            &data.MwdMean, &data.MwpMean, &data.SstMean, &data.SwhMean, &data.TpEod,
        )
        if err != nil {
            log.Printf("Error scanning the rows: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "message": "Error while scanning the database rows",
            })
            return
        }
        allData = append(allData, data)
    }

    // Return the results in JSON format
    c.JSON(http.StatusOK, allData)
}


func getAvgTemperatures(c *gin.Context) {
    // Load environment variables from .env
    err := godotenv.Load()
    if err != nil {
        log.Printf("Error loading .env file: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error loading environment variables",
        })
        return
    }

    // Establish connection to the database
    connStr := os.Getenv("POSTGRES_CONNECTION_STRING")
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Printf("Error opening database: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error while connecting to the database",
        })
        return
    }
    defer db.Close()

    // Prepare the SQL query with an optional WHERE clause if a time parameter is provided
    dateTime := c.DefaultQuery("time", "")
    var query string
    var rows *sql.Rows
    if dateTime != "" {
        // Parse and format the dateTime if provided
        parsedTime, err := time.Parse("2006-01-02 15:04:05", dateTime)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{
                "message": "Invalid time format. Please use YYYY-MM-DD HH:MM:SS.",
            })
            return
        }
        formattedTime := parsedTime.Format("2006-01-02 15:04:05")

        query = `
            SELECT 
                latitude,
                longitude,
                AVG(t2m_mean) AS t2m_mean
            FROM 
                era5_data
            WHERE
                time >= $1 AND time < $1::date + INTERVAL '1 day'
            GROUP BY 
                latitude, longitude;
        `
        rows, err = db.Query(query, formattedTime)
    } else {
        query = `
            SELECT 
                latitude,
                longitude,
                AVG(t2m_mean) AS t2m_mean
            FROM 
                era5_data
            GROUP BY 
                latitude, longitude;
        `
        rows, err = db.Query(query)
    }
    if err != nil {
        log.Printf("Error querying the database: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error while querying the database",
        })
        return
    }
    defer rows.Close()

    // Scan the results into a slice of AverageTemperatureData
    var avgData []AverageTemperatureData
    for rows.Next() {
        var data AverageTemperatureData
        if err := rows.Scan(&data.Latitude, &data.Longitude, &data.T2mMean); err != nil {
            log.Printf("Error scanning the rows: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "message": "Error while scanning the database rows",
            })
            return
        }
        avgData = append(avgData, data)
    }

    // Return the results in JSON format
    c.JSON(http.StatusOK, avgData)
}

func getMaxHighClimateData(c *gin.Context) {
    err := godotenv.Load()
    if err != nil {
        log.Fatalf("Error loading .env file")
    }

    connStr := os.Getenv("POSTGRES_CONNECTION_STRING")

    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Printf("Error opening database: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error while connecting to the database",
        })
        return
    }
    defer db.Close()

    query := `
        SELECT 
            latitude AS Lat,
            longitude AS Long,
            MAX(t2m_max) AS Max_Daily_High
        FROM 
            era5_data
        GROUP BY 
            latitude, longitude;
    `

    rows, err := db.Query(query)
    if err != nil {
        log.Printf("Error querying the database: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error while querying the database",
        })
        return
    }
    defer rows.Close()

    var maxHighData []ClimateMaxHighData
    for rows.Next() {
        var data ClimateMaxHighData
        err = rows.Scan(&data.Lat, &data.Long, &data.Max_Daily_High)
        if err != nil {
            log.Printf("Error scanning the rows: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "message": "Error while scanning the database rows",
            })
            return
        }
        maxHighData = append(maxHighData, data)
    }

    c.JSON(http.StatusOK, maxHighData)
}

func getMinLowClimateData(c *gin.Context) {
    err := godotenv.Load()
    if err != nil {
        log.Fatalf("Error loading .env file")
    }

    connStr := os.Getenv("POSTGRES_CONNECTION_STRING")

    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Printf("Error opening database: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error while connecting to the database",
        })
        return
    }
    defer db.Close()

    query := `
        SELECT 
            latitude AS Lat,
            longitude AS Long,
            MIN(t2m_min) AS Min_Daily_Low
        FROM 
            era5_data
        GROUP BY 
            latitude, longitude;
    `

    rows, err := db.Query(query)
    if err != nil {
        log.Printf("Error querying the database: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error while querying the database",
        })
        return
    }
    defer rows.Close()

    var minLowData []ClimateMinLowData
    for rows.Next() {
        var data ClimateMinLowData
        err = rows.Scan(&data.Lat, &data.Long, &data.Min_Daily_Low)
        if err != nil {
            log.Printf("Error scanning the rows: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "message": "Error while scanning the database rows",
            })
            return
        }
        minLowData = append(minLowData, data)
    }

    c.JSON(http.StatusOK, minLowData)
}

func getPrecipitationData(c *gin.Context) {
    // Load environment variables
    err := godotenv.Load()
    if err != nil {
        log.Fatalf("Error loading .env file")
    }

    // Get the PostgreSQL connection string from environment variables
    connStr := os.Getenv("POSTGRES_CONNECTION_STRING")

    // Open a database connection
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Printf("Error opening database: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error while connecting to the database",
        })
        return
    }
    defer db.Close()

    // Define the SQL query for fetching precipitation data
    query := `
        SELECT 
            time,
            latitude,
            longitude,
            tp_eod
        FROM 
            era5_data;
    `

    // Execute the query
    rows, err := db.Query(query)
    if err != nil {
        log.Printf("Error querying the database for precipitation data: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error while querying the database for precipitation data",
        })
        return
    }
    defer rows.Close()

    // Define a slice to hold the precipitation data
    var precipitationData []struct {
        Time      time.Time       `json:"time"`
        Latitude  float64         `json:"latitude"`
        Longitude float64         `json:"longitude"`
        TpEod     sql.NullFloat64 `json:"tp_eod,omitempty"` // End-of-day total precipitation
    }

    // Iterate over the query results
    for rows.Next() {
        var data struct {
            Time      time.Time       `json:"time"`
            Latitude  float64         `json:"latitude"`
            Longitude float64         `json:"longitude"`
            TpEod     sql.NullFloat64 `json:"tp_eod,omitempty"`
        }
        // Scan the result into the data struct
        err = rows.Scan(&data.Time, &data.Latitude, &data.Longitude, &data.TpEod)
        if err != nil {
            log.Printf("Error scanning the rows for precipitation data: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "message": "Error while scanning the database rows for precipitation data",
            })
            return
        }
        // Append the data to the slice
        precipitationData = append(precipitationData, data)
    }

    // Return the precipitation data as JSON
    c.JSON(http.StatusOK, precipitationData)
}



func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	serviceKey := os.Getenv("SERVICE_KEY")
	supabaseURL := os.Getenv("SUPABASE_URL")

	if serviceKey == "" || supabaseURL == "" {
		log.Fatalf("Environment variables not set correctly")
	}

	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	router.Use(cors.New(config))

	router.GET("/api/climate/", getAllClimateData)
	router.GET("api/climate/avg", getAvgTemperatures)
	router.GET("/api/climate/max-high", getMaxHighClimateData)
	router.GET("/api/climate/min-low", getMinLowClimateData)
	router.GET("/api/climate/precipitation", getPrecipitationData)

	router.Run(":4000")
}
