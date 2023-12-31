package main

import (
	"database/sql"

	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
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
	Time              time.Time       `json:"time"`
	Latitude          float64         `json:"latitude"`
	Longitude         float64         `json:"longitude"`
	MwdMean           sql.NullFloat64 `json:"mwd_mean,omitempty"`
	MwpMean           sql.NullFloat64 `json:"mwp_mean,omitempty"`
	SstMean           sql.NullFloat64 `json:"sst_mean,omitempty"`
	SwhMean           sql.NullFloat64 `json:"swh_mean,omitempty"`
	D2mMin            sql.NullFloat64 `json:"d2m_min,omitempty"`
	D2mMean           sql.NullFloat64 `json:"d2m_mean,omitempty"`
	D2mMax            sql.NullFloat64 `json:"d2m_max,omitempty"`
	T2mMin            sql.NullFloat64 `json:"t2m_min,omitempty"`
	T2mMean           sql.NullFloat64 `json:"t2m_mean,omitempty"`
	T2mMax            sql.NullFloat64 `json:"t2m_max,omitempty"`
	TccMin            sql.NullFloat64 `json:"tcc_min,omitempty"`
	TccMean           sql.NullFloat64 `json:"tcc_mean,omitempty"`
	TccMax            sql.NullFloat64 `json:"tcc_max,omitempty"`
	TpEod             float64         `json:"tp_eod,omitempty"`
	WindSpeedMean     sql.NullFloat64 `json:"wind_speed_mean,omitempty"`
	WindDirectionMean sql.NullFloat64 `json:"wind_direction_mean,omitempty"`
	WindSpeedMin      sql.NullFloat64 `json:"wind_speed_min,omitempty"`
	WindDirectionMin  sql.NullFloat64 `json:"wind_direction_min,omitempty"`
	WindSpeedMax      sql.NullFloat64 `json:"wind_speed_max,omitempty"`
	WindDirectionMax  sql.NullFloat64 `json:"wind_direction_max,omitempty"`
	//Geom                *Geometry       `json:"geom,omitempty"` // Geometry is a custom type for handling geom data
}

type Era5Averaged struct {
	Lat               float64  `json:"Lat"`
	Long              float64  `json:"Long"`
	MwdMean           *float64 `json:"mwd_mean,omitempty"`
	MwpMean           *float64 `json:"mwp_mean,omitempty"`
	SstMean           *float64 `json:"sst_mean,omitempty"`
	SwhMean           *float64 `json:"swh_mean,omitempty"`
	WindSpeedMean     *float64 `json:"wind_speed_mean,omitempty"`
	WindDirectionMean *float64 `json:"wind_direction_mean,omitempty"`
	D2mMin            *float64 `json:"d2m_min,omitempty"`
	D2mMean           *float64 `json:"d2m_mean,omitempty"`
	D2mMax            *float64 `json:"d2m_max,omitempty"`
	T2mMin            *float64 `json:"t2m_min,omitempty"`
	T2mMean           *float64 `json:"t2m_mean,omitempty"`
	T2mMax            *float64 `json:"t2m_max,omitempty"`
	TccMin            *float64 `json:"tcc_min,omitempty"`
	TccMean           *float64 `json:"tcc_mean,omitempty"`
	TccMax            *float64 `json:"tcc_max,omitempty"`
	TpSum             float64  `json:"tp_sum,omitempty"`
	PrecipitationType *string  `json:"precipitation_type,omitempty"` // New field for precipitation type
	Month             int      `json:"Month"`
	Day               int      `json:"Day"`
	Max_Daily_High    float64  `json:"Max_Daily_High"`
	Min_Daily_Low     float64  `json:"Min_Daily_Low`
}

type AverageTemperatureData struct {
	Lat     float64 `json:"Lat"`
	Long    float64 `json:"Long"`
	T2mMean float64 `json:"t2m_mean"`
}

type ClimateMaxHighData struct {
	Lat            float64 `json:"Lat"`
	Long           float64 `json:"Long"`
	Max_Daily_High float64 `json:"Max_Daily_High"`
}

type ClimateMinLowData struct {
	Lat           float64 `json:"Lat"`
	Long          float64 `json:"Long"`
	Min_Daily_Low float64 `json:"Min_Daily_Low`
}

type precipitationData struct {
	Time  time.Time `json:"time"`
	Lat   float64   `json:"Lat"`
	Long  float64   `json:"Long"`
	TpSum float64   `json:"tp_sum"` // End-of-day total precipitation
}

// SeaWaveHeightData defines the JSON format for sea wave height response
type SeaWaveHeightData struct {
	Lat                  float64 `json:"Lat"`
	Long                 float64 `json:"Long"`
	Mean_Sea_Wave_Height float64 `json:"mean_sea_wave_height,omitempty"`
}

type WindSpeed struct {
	Time              time.Time `json:"time"`
	Lat               float64   `json:"Lat"`
	Long              float64   `json:"Long"`
	WindDirectionMean float64   `json:"wind_direction_mean"`
	WindSpeedMean     float64   `json:"wind_speed_mean"`
}

// SeaWaveHeightData defines the JSON format for sea wave height response
type TotalCloudCoverData struct {
	Lat                    float64 `json:"Lat"`
	Long                   float64 `json:"Long"`
	Mean_Total_Cloud_Cover float64 `json:"mean_total_cloud_cover"`
}

type AllCoordinates struct {
	Lat  float64 `json:"Lat"`
	Long float64 `json:"Long"`
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
		err := rows.Scan(&data.Time, &data.Lat, &data.Long, &data.WindDirectionMean, &data.WindSpeedMean)
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

// Function to get average temperatures
func getAvgTemperaturesAverage(c *gin.Context) {
	// Extract the 'month' and 'day' query parameters
	month, day := c.Query("month"), c.Query("day")
	if month == "" || day == "" {
		respondWithError(c, http.StatusBadRequest, "Month and day parameters are required.", nil)
		return
	}

	// Use the prepared query with placeholders for month and day
	query := QueryAvgTemperaturesAverage
	rows, err := db.Query(query, month, day)
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
		return
	}
	defer rows.Close()

	var avgData []AverageTemperatureData
	for rows.Next() {
		var data AverageTemperatureData
		// Scan only the columns that are being selected in the query
		if err = rows.Scan(&data.Lat, &data.Long, &data.T2mMean); err != nil {
			respondWithError(c, http.StatusInternalServerError, "Error while scanning the database rows", err)
			return
		}
		avgData = append(avgData, data)
	}

	if err = rows.Err(); err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error iterating over the results", err)
		return
	}

	c.JSON(http.StatusOK, avgData)
}

func getMaxHighClimateDataAverage(c *gin.Context) {
	// Extract the 'month' and 'day' query parameters
	month, day := c.Query("month"), c.Query("day")
	if month == "" || day == "" {
		respondWithError(c, http.StatusBadRequest, "Month and day parameters are required.", nil)
		return
	}

	// Use the prepared query with placeholders for month and day
	query := QueryMaxHighClimateDataAverage
	rows, err := db.Query(query, month, day)
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
		return
	}
	defer rows.Close()

	var maxHighData []ClimateMaxHighData
	for rows.Next() {
		var data ClimateMaxHighData
		// Scan only the columns that are being selected in the query
		if err = rows.Scan(&data.Lat, &data.Long, &data.Max_Daily_High); err != nil {
			respondWithError(c, http.StatusInternalServerError, "Error scanning the rows", err)
			return
		}
		maxHighData = append(maxHighData, data)
	}

	c.JSON(http.StatusOK, maxHighData)
}

func getMinLowClimateDataAverage(c *gin.Context) {
	// Extract the 'month' and 'day' query parameters
	month, day := c.Query("month"), c.Query("day")
	if month == "" || day == "" {
		respondWithError(c, http.StatusBadRequest, "Month and day parameters are required.", nil)
		return
	}

	// Use the prepared query with placeholders for month and day
	query := QueryMinLowClimateDataAverage
	rows, err := db.Query(query, month, day)
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
		return
	}
	defer rows.Close()

	var minLowData []ClimateMinLowData
	for rows.Next() {
		var data ClimateMinLowData
		// Scan only the columns that are being selected in the query
		if err = rows.Scan(&data.Lat, &data.Long, &data.Min_Daily_Low); err != nil {
			respondWithError(c, http.StatusInternalServerError, "Error scanning the rows", err)
			return
		}
		minLowData = append(minLowData, data)
	}

	c.JSON(http.StatusOK, minLowData)
}

func getPrecipitationDataAverage(c *gin.Context) {
	// Extract the 'month' and 'day' query parameters
	month, day := c.Query("month"), c.Query("day")
	if month == "" || day == "" {
		respondWithError(c, http.StatusBadRequest, "Month and day parameters are required.", nil)
		return
	}

	// Use the prepared query with placeholders for month and day
	query := QueryPrecipitationDataAverage
	rows, err := db.Query(query, month, day)
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
		return
	}
	defer rows.Close()

	var precipitationDataSlice []precipitationData
	for rows.Next() {
		var data precipitationData
		var tpSum sql.NullFloat64 // Temporary variable for scanning

		if err = rows.Scan(&data.Lat, &data.Long, &tpSum); err != nil {
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

func getMeanCloudCoverDataAveraged(c *gin.Context) {
	month, day := c.Query("month"), c.Query("day")
	if month == "" || day == "" {
		respondWithError(c, http.StatusBadRequest, "Month and day parameters are required.", nil)
		return
	}

	query := QueryMeanCloudCoverAverage
	rows, err := db.Query(query, month, day)
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
		return
	}
	defer rows.Close()

	var results []TotalCloudCoverData
	for rows.Next() {
		var data TotalCloudCoverData
		err := rows.Scan(&data.Lat, &data.Long, &data.Mean_Total_Cloud_Cover)
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

func getWindSpeedGroupedByLocationAverage(c *gin.Context) {
	// Extract the 'month' and 'day' query parameters
	month, day := c.Query("month"), c.Query("day")
	if month == "" || day == "" {
		respondWithError(c, http.StatusBadRequest, "Month and day parameters are required.", nil)
		return
	}

	// Use the prepared query with placeholders for month and day
	query := QueryWindSpeedGroupedByLocationAverage
	rows, err := db.Query(query, month, day)
	if err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
		return
	}
	defer rows.Close()

	var results []WindSpeed
	for rows.Next() {
		var data WindSpeed
		// Scan only the columns that are being selected in the query
		err := rows.Scan(&data.Lat, &data.Long, &data.WindDirectionMean, &data.WindSpeedMean)
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

func getClimateDataByCoordinatesAndDate(c *gin.Context) {
    // Extract the 'date', 'lat', and 'long' query parameters
    dateStr := c.Query("date") // expecting "YYYY-MM-DD" format
    latStr := c.Query("lat")
    longStr := c.Query("long")

    if dateStr == "" || latStr == "" || longStr == "" {
        respondWithError(c, http.StatusBadRequest, "Date, latitude, and longitude parameters are required.", nil)
        return
    }

    // Parse the date string
    parsedDate, err := time.Parse("2006-01-02", dateStr)
    if err != nil {
        respondWithError(c, http.StatusBadRequest, "Invalid date format. Please use YYYY-MM-DD.", err)
        return
    }

    // Calculate the start of the next day to cover the whole day
    nextDay := parsedDate.Add(24 * time.Hour)

    // Prepare and execute the SQL query
    query := `SELECT time, latitude, longitude, mwd_mean, mwp_mean, sst_mean, swh_mean, 
             d2m_min, d2m_mean, d2m_max, t2m_min, t2m_mean, t2m_max, tcc_min, tcc_mean, 
             tcc_max, wind_speed_mean, wind_direction_mean 
             FROM era5_refined WHERE latitude = $1 AND longitude = $2 AND 
             time >= $3 AND time < $4;`
    rows, err := db.Query(query, latStr, longStr, parsedDate, nextDay)
    if err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error querying the database", err)
        return
    }
	
    defer rows.Close()

    // Slice to hold the results
    var results []Era5Data

    // Iterate over the rows
    for rows.Next() {
        var data Era5Data
        err := rows.Scan(&data.Time, &data.Latitude, &data.Longitude, &data.MwdMean, &data.MwpMean, &data.SstMean, &data.SwhMean, 
                         &data.D2mMin, &data.D2mMean, &data.D2mMax, &data.T2mMin, &data.T2mMean, &data.T2mMax, &data.TccMin, &data.TccMean, 
                         &data.TccMax, &data.WindSpeedMean, &data.WindDirectionMean)
        if err != nil {
            respondWithError(c, http.StatusInternalServerError, "Error scanning the rows", err)
            return
        }
        results = append(results, data)
    }

    // Check for errors from iterating over rows
    if err = rows.Err(); err != nil {
        respondWithError(c, http.StatusInternalServerError, "Error iterating over the results", err)
        return
    }

    // Send the results back as JSON
    c.JSON(http.StatusOK, results)
}

func printClimateDataForDateLatLong(dateStr, latStr, longStr string) {
    log.Println("Executing printClimateDataForDateLatLong with parameters:", dateStr, latStr, longStr)

    query := `
        SELECT time, latitude, longitude, mwd_mean, mwp_mean, sst_mean, swh_mean,
               d2m_min, d2m_mean, d2m_max, t2m_min, t2m_mean, t2m_max, 
               tcc_min, tcc_mean, tcc_max, wind_speed_mean, wind_direction_mean
        FROM era5_refined 
        WHERE date(time) = $1 AND latitude = $2 AND longitude = $3;
    `

    rows, err := db.Query(query, dateStr, latStr, longStr)
    if err != nil {
        log.Fatalf("Error querying the database: %v", err)
        return
    }
    defer rows.Close()

    for rows.Next() {
        var data Era5Data
        if err := rows.Scan(&data.Time, &data.Latitude, &data.Longitude, 
                            &data.MwdMean, &data.MwpMean, &data.SstMean, &data.SwhMean, 
                            &data.D2mMin, &data.D2mMean, &data.D2mMax, &data.T2mMin, 
                            &data.T2mMean, &data.T2mMax, &data.TccMin, &data.TccMean, 
                            &data.TccMax, &data.WindSpeedMean, &data.WindDirectionMean); err != nil {
            log.Fatalf("Error scanning the rows: %v", err)
            return
        }
        fmt.Printf("%+v\n", data)
    }

    if err = rows.Err(); err != nil {
        log.Fatalf("Error iterating over the results: %v", err)
    }
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
	router.GET("/api/climate/cloudcover-40-avg", getMeanCloudCoverDataAveraged)

	router.GET("/api/climate/data-by-coordinates-date", getClimateDataByCoordinatesAndDate)
	
	router.Run(":4001")
}
