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

var db *sql.DB

func init() {
    var err error
    // Load environment variables once during application initialization
    err = godotenv.Load()
    if err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }

    // Get the PostgreSQL connection string from environment variables
    connStr := os.Getenv("POSTGRES_CONNECTION_STRING")

    // Initialize the database connection pool
    db, err = sql.Open("postgres", connStr)
    if err != nil {
        log.Fatalf("Error setting up database connection pool: %v", err)
    }

    // Optional: check the database connection is alive
    if err = db.Ping(); err != nil {
        log.Fatalf("Error connecting to the database: %v", err)
    }
}

func respondWithError(c *gin.Context, code int, message string, err error) {
    // Log the detailed error if it's provided
    if err != nil {
        log.Printf("%s: %v", message, err)
    }
    
    // Send the error message with the status code
    c.JSON(code, gin.H{
        "error": message,
    })
}

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
	Time                time.Time       `json:"time"`
	Latitude            float64         `json:"latitude"`
	Longitude           float64         `json:"longitude"`
	MwdMean             sql.NullFloat64 `json:"mwd_mean,omitempty"`
	MwpMean             sql.NullFloat64 `json:"mwp_mean,omitempty"`
	SstMean             sql.NullFloat64 `json:"sst_mean,omitempty"`
	SwhMean             sql.NullFloat64 `json:"swh_mean,omitempty"`
	D2mMin              sql.NullFloat64 `json:"d2m_min,omitempty"`
	D2mMean             sql.NullFloat64 `json:"d2m_mean,omitempty"`
	D2mMax              sql.NullFloat64 `json:"d2m_max,omitempty"`
	T2mMin              sql.NullFloat64 `json:"t2m_min,omitempty"`
	T2mMean             sql.NullFloat64 `json:"t2m_mean,omitempty"`
	T2mMax              sql.NullFloat64 `json:"t2m_max,omitempty"`
	TccMin              sql.NullFloat64 `json:"tcc_min,omitempty"`
	TccMean             sql.NullFloat64 `json:"tcc_mean,omitempty"`
	TccMax              sql.NullFloat64 `json:"tcc_max,omitempty"`
	TpEod               float64         `json:"tp_eod,omitempty"`
	WindSpeedMean       sql.NullFloat64 `json:"wind_speed_mean,omitempty"`
	WindDirectionMean   sql.NullFloat64 `json:"wind_direction_mean,omitempty"`
	WindSpeedMin        sql.NullFloat64 `json:"wind_speed_min,omitempty"`
	WindDirectionMin    sql.NullFloat64 `json:"wind_direction_min,omitempty"`
	WindSpeedMax        sql.NullFloat64 `json:"wind_speed_max,omitempty"`
	WindDirectionMax    sql.NullFloat64 `json:"wind_direction_max,omitempty"`
	//Geom                *Geometry       `json:"geom,omitempty"` // Geometry is a custom type for handling geom data
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

type precipitationData struct {
    Time  time.Time       `json:"time"`
    Lat   float64         `json:"latitude"`
    Long  float64         `json:"longitude"`
    TpEod sql.NullFloat64 `json:"tp_eod,omitempty"` // End-of-day total precipitation
}

// SeaWaveHeightData defines the JSON format for sea wave height response
type SeaWaveHeightData struct {
    Lat                 float64       `json:"lat"`
    Long                float64       `json:"long"`
    Mean_Sea_Wave_Height sql.NullFloat64 `json:"mean_sea_wave_height,omitempty"`
}

type WindSpeed struct {
    Time                time.Time `json:"time"`
    Latitude            float64   `json:"latitude"`
    Longitude           float64   `json:"longitude"`
    WindDirectionMean   float64   `json:"wind_direction_mean"`
    WindSpeedMean       float64   `json:"wind_speed_mean"`
}


// SeaWaveHeightData defines the JSON format for sea wave height response
type TotalCloudCoverData struct {
    Lat                 float64       `json:"lat"`
    Long                float64       `json:"long"`
    Mean_Total_Cloud_Cover sql.NullFloat64 `json:"mean_total_cloud_cover"`
}

/*
// getAllClimateData retrieves all climate data from the database and sends it as JSON.
func getAllClimateData(c *gin.Context) {
    // Define the query to select all climate data
    
    // Execute the query
    rows, err := db.Query(QuerySelectAllClimateData)
    if err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
        return
    }
    defer rows.Close()

    // Iterate over the rows and populate a slice of Era5Data
    var allData []Era5Data
    for rows.Next() {
        var data Era5Data
        // Assume Era5Data has fields that correspond to the columns selected in the query
        if err := rows.Scan(&data.Time, &data.Latitude, &data.Longitude, &data.U10Min, &data.U10Mean, &data.U10Max, &data.V10Min, &data.V10Mean, &data.V10Max, &data.D2mMin, &data.D2mMean, &data.D2mMax, &data.T2mMin, &data.T2mMean, &data.T2mMax, &data.TccMin, &data.TccMean, &data.TccMax, &data.MwdMean, &data.MwpMean, &data.SstMean, &data.SwhMean, &data.TpEod); err != nil {
            respondWithError(c, http.StatusInternalServerError, "Error scanning the rows", err)
            return
        }
        allData = append(allData, data)
    }

    // Check for errors from iterating over rows
    if err = rows.Err(); err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error while iterating over rows", err)
        return
    }

    // Return the results in JSON format
    c.JSON(http.StatusOK, allData)
}*/

func getAvgTemperatures(c *gin.Context) {
    // Prepare the SQL query with an optional WHERE clause if a time parameter is provided
    dateTime := c.DefaultQuery("time", "")
    var queryAvgTemperatures string
    var rows *sql.Rows
    var err error

    if dateTime != "" {
        // Parse and format the dateTime if provided
        var parsedTime time.Time
        parsedTime, err = time.Parse("2006-01-02 15:04:05", dateTime)
        if err != nil {
            respondWithError(c, http.StatusBadRequest, "Invalid time format. Please use YYYY-MM-DD HH:MM:SS.", err)
            return
        }
        formattedTime := parsedTime.Format("2006-01-02 15:04:05")

        queryAvgTemperatures = "SELECT latitude, longitude, AVG(t2m_mean) FROM era5_refined WHERE time = $1 GROUP BY latitude, longitude" // Replace with your actual query
        rows, err = db.Query(queryAvgTemperatures, formattedTime)
    } else {
        queryAvgTemperatures = "SELECT latitude, longitude, AVG(t2m_mean) FROM era5_refined GROUP BY latitude, longitude" // Replace with your actual query
        rows, err = db.Query(queryAvgTemperatures)
    }

    if err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
        return
    }
    defer rows.Close()

    // Scan the results into a slice of AverageTemperatureData
    var avgData []AverageTemperatureData
    for rows.Next() {
        var data AverageTemperatureData
        if err = rows.Scan(&data.Latitude, &data.Longitude, &data.T2mMean); err != nil {
            respondWithError(c, http.StatusInternalServerError, "Error while scanning the database rows", err)
            return
        }
        avgData = append(avgData, data)
    }

    // Return the results in JSON format
    c.JSON(http.StatusOK, avgData)
}

func getMaxHighClimateData(c *gin.Context) {
	// Extract the 'time' query parameter
	dateTime := c.Query("time") // using Query instead of DefaultQuery to make 'time' a mandatory parameter
	if dateTime == "" {
		respondWithError(c, http.StatusBadRequest, "Time parameter is required.", nil)
		return
	}

	// Parse and format the dateTime if provided
	parsedTime, err := time.Parse("2006-01-02 15:04:05", dateTime)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid time format. Please use YYYY-MM-DD HH:MM:SS.", err)
		return
	}
	formattedTime := parsedTime.Format("2006-01-02 15:04:05")

	// Use the prepared query with the placeholder for the time parameter
	rows, err := db.Query(QueryMaxHighClimateData, formattedTime)
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
		return
	}
	defer rows.Close()

	// Prepare a slice to hold the results
	var maxHighData []ClimateMaxHighData
	for rows.Next() {
		var data ClimateMaxHighData
		if err = rows.Scan(&data.Lat, &data.Long, &data.Max_Daily_High); err != nil {
			respondWithError(c, http.StatusInternalServerError, "Error scanning the rows", err)
			return
		}
		maxHighData = append(maxHighData, data)
	}

	// Check for errors from iterating over rows
	if err = rows.Err(); err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error iterating over the results", err)
		return
	}

	// Send the results back as JSON
	c.JSON(http.StatusOK, maxHighData)
}

// getMinLowClimateData gets the data for the minimum low climate values.
func getMinLowClimateData(c *gin.Context) {
	// Extract the 'time' query parameter
	dateTime := c.Query("time") // using Query instead of DefaultQuery to make 'time' a mandatory parameter
	if dateTime == "" {
		respondWithError(c, http.StatusBadRequest, "Time parameter is required.", nil)
		return
	}

	// Parse and format the dateTime if provided
	parsedTime, err := time.Parse("2006-01-02 15:04:05", dateTime)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid time format. Please use YYYY-MM-DD HH:MM:SS.", err)
		return
	}
	formattedTime := parsedTime.Format("2006-01-02 15:04:05")

	// Use the prepared query with the placeholder for the time parameter
	rows, err := db.Query(QueryMinLowClimateData, formattedTime)
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
		return
	}
	defer rows.Close()

	// Prepare a slice to hold the results
	var minLowData []ClimateMinLowData
	for rows.Next() {
		var data ClimateMinLowData
		if err = rows.Scan(&data.Lat, &data.Long, &data.Min_Daily_Low); err != nil {
			respondWithError(c, http.StatusInternalServerError, "Error scanning the rows", err)
			return
		}
		minLowData = append(minLowData, data)
	}

	// Check for errors from iterating over rows
	if err = rows.Err(); err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error iterating over the results", err)
		return
	}

	// Send the results back as JSON
	c.JSON(http.StatusOK, minLowData)
}

func getPrecipitationData(c *gin.Context) {
	// Extract the 'time' query parameter
	dateTime := c.Query("time") // using Query instead of DefaultQuery to make 'time' a mandatory parameter
	if dateTime == "" {
		respondWithError(c, http.StatusBadRequest, "Time parameter is required.", nil)
		return
	}

	// Parse and format the dateTime if provided
	parsedTime, err := time.Parse("2006-01-02 15:04:05", dateTime)
	if err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid time format. Please use YYYY-MM-DD HH:MM:SS.", err)
		return
	}
	formattedTime := parsedTime.Format("2006-01-02 15:04:05")


	// Use the prepared query with the placeholder for the time parameter
    rows, err := db.Query(QueryPrecipitationData, formattedTime)
    if err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
        return
    }
    defer rows.Close()

    // Prepare a slice to hold the results
    var precipitationDataSlice []precipitationData
    for rows.Next() {
        var data precipitationData
        if err = rows.Scan(&data.Time, &data.Lat, &data.Long, &data.TpEod); err != nil {
            respondWithError(c, http.StatusInternalServerError, "Error scanning the rows", err)
            return
        }
        precipitationDataSlice = append(precipitationDataSlice, data)
    }


	// Check for errors from iterating over rows
	if err = rows.Err(); err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error iterating over the results", err)
		return
	}

	// Send the results back as JSON
	c.JSON(http.StatusOK, precipitationDataSlice)
}


func getWindSpeedGroupedByLocation(c *gin.Context) {
    dateTime := c.Query("time")
    if dateTime == "" {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Time parameter is required",
        })
        return
    }

    parsedTime, err := time.Parse("2006-01-02 15:04:05", dateTime)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Invalid time format. Please use YYYY-MM-DD HH:MM:SS.",
        })
        return
    }

    rows, err := db.Query(QueryWindSpeedGroupedByLocation, parsedTime)
    if err != nil {
        log.Printf("Error querying the database for wind speed data: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error while querying the database for wind speed data",
        })
        return
    }
    defer rows.Close()

    var results []WindSpeed
    for rows.Next() {
        var data WindSpeed
        err := rows.Scan(&data.Time, &data.Latitude, &data.Longitude, &data.WindDirectionMean, &data.WindSpeedMean)
        if err != nil {
            log.Printf("Error scanning the rows for wind speed data: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "message": "Error while scanning the database rows for wind speed data",
            })
            return
        }
        results = append(results, data)
    }

    c.JSON(http.StatusOK, results)
}



func getMeanSeaWaveHeightData(c *gin.Context) {
    // Extract the 'time' query parameter
    dateTime := c.Query("time") // using Query instead of DefaultQuery to make 'time' a mandatory parameter
    if dateTime == "" {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Time parameter is required.",
        })
        return
    }

    // Parse and format the dateTime if provided
    parsedTime, err := time.Parse("2006-01-02 15:04:05", dateTime)
    if err != nil {
        log.Printf("Error parsing time: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Invalid time format. Please use YYYY-MM-DD HH:MM:SS.",
        })
        return
    }
    formattedTime := parsedTime.Format("2006-01-02 15:04:05")

    rows, err := db.Query(QueryMeanSeaWaveHeight, formattedTime)
    if err != nil {
        log.Printf("Error querying the database for mean sea wave height data: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error while querying the database for mean sea wave height data",
        })
        return
    }
    defer rows.Close()

    var meanWaveData []SeaWaveHeightData
    for rows.Next() {
        var data SeaWaveHeightData
if err = rows.Scan(&data.Lat, &data.Long, &data.Mean_Sea_Wave_Height); err != nil {
    log.Printf("Error scanning the rows for sea wave height data: %v", err)
    c.JSON(http.StatusInternalServerError, gin.H{
        "message": "Error while scanning the database rows for sea wave height data",
    })
    return
}
        meanWaveData = append(meanWaveData, data)
    }

    c.JSON(http.StatusOK, meanWaveData)
}

func getMeanCloudCoverData(c *gin.Context) {
    // Extract the 'time' query parameter
    dateTime := c.Query("time") // using Query instead of DefaultQuery to make 'time' a mandatory parameter
    if dateTime == "" {
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Time parameter is required.",
        })
        return
    }

    // Parse and format the dateTime if provided
    parsedTime, err := time.Parse("2006-01-02 15:04:05", dateTime)
    if err != nil {
        log.Printf("Error parsing time: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{
            "message": "Invalid time format. Please use YYYY-MM-DD HH:MM:SS.",
        })
        return
    }
    formattedTime := parsedTime.Format("2006-01-02 15:04:05")

    // Modify the SQL query to use the formattedTime
    const QueryMeanCloudCover = `
        SELECT 
            latitude AS Lat,
            longitude AS Long,
            AVG(tcc_mean) AS Total_Cloud_Cover
        FROM 
            era5_refined
        WHERE
            time = $1
        GROUP BY 
            latitude, longitude;
    `

    rows, err := db.Query(QueryMeanCloudCover, formattedTime)
    if err != nil {
        log.Printf("Error querying the database for mean cloud cover data: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "message": "Error while querying the database for mean cloud cover data",
        })
        return
    }
    defer rows.Close()

    var meanCloudData []TotalCloudCoverData
    for rows.Next() {
        var data TotalCloudCoverData
        if err = rows.Scan(&data.Lat, &data.Long, &data.Mean_Total_Cloud_Cover); err != nil {
            log.Printf("Error scanning the rows for cloud cover data: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "message": "Error while scanning the database rows for cloud cover data",
            })
            return
        }
        meanCloudData = append(meanCloudData, data)
    }

    c.JSON(http.StatusOK, meanCloudData)
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

	//router.GET("/api/climate/", getAllClimateData)
	router.GET("api/climate/avg", getAvgTemperatures)
	router.GET("/api/climate/max-high", getMaxHighClimateData)
	router.GET("/api/climate/min-low", getMinLowClimateData)
	router.GET("/api/climate/precipitation", getPrecipitationData)
   router.GET("/api/climate/windspeed", getWindSpeedGroupedByLocation)
    router.GET("/api/climate/waveheight", getMeanSeaWaveHeightData)
    router.GET("/api/climate/cloudcover", getMeanCloudCoverData)

	router.Run(":4000")
}
