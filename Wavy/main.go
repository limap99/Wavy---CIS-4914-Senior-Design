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
	Lat  float64 `json:"Lat"`
	Long float64 `json:"Long"`
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
    Lat   float64         `json:"Lat"`
    Long  float64         `json:"Long"`
    TpSum float64 `json:"tp_sum"` // End-of-day total precipitation
}

// SeaWaveHeightData defines the JSON format for sea wave height response
type SeaWaveHeightData struct {
    Lat                 float64       `json:"Lat"`
    Long                float64       `json:"Long"`
    Mean_Sea_Wave_Height float64 `json:"mean_sea_wave_height,omitempty"`
}

type WindSpeed struct {
    Time                time.Time `json:"time"`
    Latitude            float64   `json:"Lat"`
    Longitude           float64   `json:"Long"`
    WindDirectionMean   float64   `json:"wind_direction_mean"`
    WindSpeedMean       float64   `json:"wind_speed_mean"`
}


// SeaWaveHeightData defines the JSON format for sea wave height response
type TotalCloudCoverData struct {
    Lat                 float64       `json:"Lat"`
    Long                float64       `json:"Long"`
    Mean_Total_Cloud_Cover float64`json:"mean_total_cloud_cover"`
}

type AllCoordinates struct {
    Lat                 float64        `json:"Lat"`
    Long                float64        `json:"Long"`
}

    
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

        queryAvgTemperatures = "SELECT latitude AS Lat, longitude AS Long, ROUND(AVG(t2m_mean), 1) AS t2m_mean FROM era5_refined WHERE time = $1 GROUP BY latitude, longitude"
        rows, err = db.Query(queryAvgTemperatures, formattedTime)
    } else {
        queryAvgTemperatures = "SELECT latitude AS Lat, longitude AS Long, ROUND(AVG(t2m_mean), 1) AS t2m_mean FROM era5_refined GROUP BY latitude, longitude"
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
        if err = rows.Scan(&data.Lat, &data.Long, &data.T2mMean); err != nil {
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
        var tpSum sql.NullFloat64 // Use a temporary NullFloat64 variable

        if err = rows.Scan(&data.Time, &data.Lat, &data.Long, &tpSum); err != nil {
            respondWithError(c, http.StatusInternalServerError, "Error scanning the rows", err)
            return
        }

        if tpSum.Valid {
            data.TpSum = tpSum.Float64 // Only set TpSum if it's valid
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
        var meanWaveHeight sql.NullFloat64 // Temporary variable for scanning

        if err = rows.Scan(&data.Lat, &data.Long, &meanWaveHeight); err != nil {
            log.Printf("Error scanning the rows for sea wave height data: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "message": "Error while scanning the database rows for sea wave height data",
            })
            return
        }

        if meanWaveHeight.Valid {
            data.Mean_Sea_Wave_Height = meanWaveHeight.Float64 // Assign if valid
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
        var meanCloudCover sql.NullFloat64 // Temporary variable for scanning

        if err = rows.Scan(&data.Lat, &data.Long, &meanCloudCover); err != nil {
            log.Printf("Error scanning the rows for cloud cover data: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "message": "Error while scanning the database rows for cloud cover data",
            })
            return
        }

        if meanCloudCover.Valid {
            data.Mean_Total_Cloud_Cover = meanCloudCover.Float64 // Assign if valid
        }

        meanCloudData = append(meanCloudData, data)
    }

    c.JSON(http.StatusOK, meanCloudData)
}


func getAvgTemperaturesAverage(c *gin.Context) {
    query := QueryAvgTemperaturesAverage
    rows, err := db.Query(query)
    if err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
        return
    }
    defer rows.Close()

    var avgData []AverageTemperatureData
    for rows.Next() {
        var data AverageTemperatureData
        if err = rows.Scan(&data.Lat, &data.Long, &data.T2mMean); err != nil {
            respondWithError(c, http.StatusInternalServerError, "Error while scanning the database rows", err)
            return
        }
        avgData = append(avgData, data)
    }

    c.JSON(http.StatusOK, avgData)
}

func getMaxHighClimateDataAverage(c *gin.Context) {
    query := QueryMaxHighClimateDataAverage
    rows, err := db.Query(query)
    if err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
        return
    }
    defer rows.Close()

    var maxHighData []ClimateMaxHighData
    for rows.Next() {
        var data ClimateMaxHighData
        if err = rows.Scan(&data.Lat, &data.Long, &data.Max_Daily_High); err != nil {
            respondWithError(c, http.StatusInternalServerError, "Error scanning the rows", err)
            return
        }
        maxHighData = append(maxHighData, data)
    }

    c.JSON(http.StatusOK, maxHighData)
}

func getMinLowClimateDataAverage(c *gin.Context) {
    query := QueryMinLowClimateDataAverage
    rows, err := db.Query(query)
    if err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
        return
    }
    defer rows.Close()

    var minLowData []ClimateMinLowData
    for rows.Next() {
        var data ClimateMinLowData
        if err = rows.Scan(&data.Lat, &data.Long, &data.Min_Daily_Low); err != nil {
            respondWithError(c, http.StatusInternalServerError, "Error scanning the rows", err)
            return
        }
        minLowData = append(minLowData, data)
    }

    c.JSON(http.StatusOK, minLowData)
}

func getPrecipitationDataAverage(c *gin.Context) {
    rows, err := db.Query(QueryPrecipitationDataAverage)
    if err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
        return
    }
    defer rows.Close()

    var precipitationDataSlice []precipitationData
    for rows.Next() {
        var data precipitationData
        var tpSum sql.NullFloat64 // Temporary variable for scanning

        if err = rows.Scan(&data.Time, &data.Lat, &data.Long, &tpSum); err != nil {
            respondWithError(c, http.StatusInternalServerError, "Error scanning the rows", err)
            return
        }

        if tpSum.Valid {
            data.TpSum = tpSum.Float64 // Assign if valid
        }

        precipitationDataSlice = append(precipitationDataSlice, data)
    }

    if err = rows.Err(); err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error iterating over the results", err)
        return
    }

    c.JSON(http.StatusOK, precipitationDataSlice)
}


func getWindSpeedGroupedByLocationAverage(c *gin.Context) {
    rows, err := db.Query(QueryWindSpeedGroupedByLocationAverage)
    if err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
        return
    }
    defer rows.Close()

    var results []WindSpeed
    for rows.Next() {
        var data WindSpeed
        err := rows.Scan(&data.Latitude, &data.Longitude, &data.WindDirectionMean, &data.WindSpeedMean)
        if err != nil {
            respondWithError(c, http.StatusInternalServerError, "Error scanning the rows", err)
            return
        }
        results = append(results, data)
    }

    if err = rows.Err(); err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error iterating over the results", err)
        return
    }

    c.JSON(http.StatusOK, results)
}

func getAllCoordinates(c *gin.Context) { 
    query := QueryLatitudeLongitude
    rows, err := db.Query(query)
    if err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
        return
    }
    defer rows.Close()

    var allCoordinates []AllCoordinates
    for rows.Next() {
        var data AllCoordinates
        if err = rows.Scan(&data.Lat, &data.Long); err != nil {
            respondWithError(c, http.StatusInternalServerError, "Error scanning the rows", err)
            return
        }
        allCoordinates = append(allCoordinates, data)
    }

    c.JSON(http.StatusOK, allCoordinates)
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
    router.GET("api/climate/allcoordinates", getAllCoordinates)

    router.GET("/api/climate/temp-40-avg", getAvgTemperaturesAverage)
    router.GET("/api/climate/max-high-40-avg", getMaxHighClimateDataAverage)
    router.GET("/api/climate/min-low-40-avg", getMinLowClimateDataAverage)
    router.GET("/api/climate/precipitation-40-avg", getPrecipitationDataAverage)
    router.GET("/api/climate/windspeed-40-avg", getWindSpeedGroupedByLocationAverage)


	router.Run(":4000")
}
