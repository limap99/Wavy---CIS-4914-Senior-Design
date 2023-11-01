package main

import ( 
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
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

type ClimateData struct {
	Lat                   float64   `json:"Lat"`
	Long                  float64   `json:"Long"`
	Climate_Daily_High_F  float64   `json:"Climate_Daily_High_F"`
	Climate_Daily_Low_F   float64   `json:"Climate_Daily_Low_F"`
	Climate_Daily_Precip_In float64 `json:"Climate_Daily_Precip_In"`
	Date                  JSONDate  `json:"Date"`
}

type ClimateAvgData struct {
    Lat         float64
    Long        float64
    AvgTemp     float64  // This field represents the average temperature
}

type ClimateMaxHighData struct {
	Lat                  float64 `json:"Lat"`
	Long                 float64 `json:"Long"`
	Max_Daily_High_F     float64 `json:"Max_Daily_High_F"`
}

type ClimateMinLowData struct {
	Lat                  float64 `json:"Lat"`
	Long                 float64 `json:"Long"`
	Min_Daily_Low_F     float64 `json:"Min_Daily_Low_F"`
}

type ClimateAvgPrecipData struct {
	Lat                    float64 `json:"Lat"`
	Long                   float64 `json:"Long"`
	Avg_Daily_Precip_In    float64 `json:"Avg_Daily_Precip_In"`
}


func fetchDataFromSupabase(supabaseURL, serviceKey string) ([]ClimateData, error) {
	url := supabaseURL + "/rest/v1/Climate Data"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+serviceKey)
	req.Header.Set("apikey", serviceKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error executing request: %v", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response: %v", err)
	}

	var data []ClimateData
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("error unmarshalling data: %v", err)
	}

	return data, nil
}

func getAvgTemperatures(date string) ([]ClimateAvgData, error) {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}


	connStr := os.Getenv("POSTGRES_CONNECTION_STRING")

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	query := `
    SELECT 
        "Lat" AS Lat,
        "Long" AS Long,
        AVG(( "Climate_Daily_High_F" + "Climate_Daily_Low_F" ) / 2) AS avg_temp
    FROM 
        "Climate Data"
    WHERE
        "Date" = $1
    GROUP BY 
        "Lat", "Long";
`


rows, err := db.Query(query, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var avgData []ClimateAvgData
	for rows.Next() {
		var data ClimateAvgData
		err = rows.Scan(&data.Lat, &data.Long, &data.AvgTemp)
		if err != nil {
			return nil, err
		}
		avgData = append(avgData, data)
	}

	return avgData, nil
}

func getMaxHighTemperatures(date string) ([]ClimateMaxHighData, error) {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	connStr := os.Getenv("POSTGRES_CONNECTION_STRING")

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	query := `
    SELECT 
        "Lat" AS Lat,
        "Long" AS Long,
        MAX("Climate_Daily_High_F") AS max_high_temp
    FROM 
        "Climate Data"
    WHERE
        "Date" = $1
    GROUP BY 
        "Lat", "Long";
`

	rows, err := db.Query(query, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var maxHighData []ClimateMaxHighData
	for rows.Next() {
		var data ClimateMaxHighData
		err = rows.Scan(&data.Lat, &data.Long, &data.Max_Daily_High_F)
		if err != nil {
			return nil, err
		}
		maxHighData = append(maxHighData, data)
	}

	return maxHighData, nil
}

func getMinLowTemperatures(date string) ([]ClimateMinLowData, error) {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	connStr := os.Getenv("POSTGRES_CONNECTION_STRING")

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	query := `
    SELECT 
        "Lat" AS Lat,
        "Long" AS Long,
        MIN("Climate_Daily_Low_F") AS min_low_temp
    FROM 
        "Climate Data"
    WHERE
        "Date" = $1
    GROUP BY 
        "Lat", "Long";
`

	rows, err := db.Query(query, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var minLowData []ClimateMinLowData
	for rows.Next() {
		var data ClimateMinLowData
		err = rows.Scan(&data.Lat, &data.Long, &data.Min_Daily_Low_F)
		if err != nil {
			return nil, err
		}
		minLowData = append(minLowData, data)
	}

	return minLowData, nil
}

func getAvgPrecipitation(date string) ([]ClimateAvgPrecipData, error) {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	connStr := os.Getenv("POSTGRES_CONNECTION_STRING")

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	query := `
    SELECT 
        "Lat" AS Lat,
        "Long" AS Long,
        AVG("Climate_Daily_Precip_In") AS avg_precip
    FROM 
        "Climate Data"
    WHERE
        "Date" = $1
    GROUP BY 
        "Lat", "Long";
`
	rows, err := db.Query(query, date)
	if err != nil {
   	 	return nil, err
	}
	defer rows.Close()

	var climateData []ClimateAvgPrecipData
	for rows.Next() {
    	var data ClimateAvgPrecipData
    	if err := rows.Scan(&data.Lat, &data.Long, &data.Avg_Daily_Precip_In); err != nil {
        	return nil, err
    	}
    	climateData = append(climateData, data)
	}
	return climateData, nil
}


func getAllClimateData(c *gin.Context) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	serviceKey := os.Getenv("SERVICE_KEY")

	climateData, err := fetchDataFromSupabase(supabaseURL, serviceKey)
	if err != nil {
		log.Printf("Error while getting all climate data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error while getting all climate data",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, climateData)
}

func getAvgClimateData(c *gin.Context) {
    date := c.DefaultQuery("date", "2023-01-01") // defaulting to "2023-01-01" if not provided
    avgData, err := getAvgTemperatures(date)
	if err != nil {
		log.Printf("Error while getting avg climate data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error while getting avg climate data",
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, avgData)
}

func getMaxHighClimateData(c *gin.Context) {
    date := c.DefaultQuery("date", "2023-01-01")  // default to "2023-01-01" if not provided
    maxHighData, err := getMaxHighTemperatures(date)
	if err != nil {
		log.Printf("Error while getting max high climate data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error while getting max high climate data",
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, maxHighData)
}

func getMinLowClimateData(c *gin.Context) {
    date := c.DefaultQuery("date", "2023-01-01")  // default to "2023-01-01" if not provided
    minLowData, err := getMinLowTemperatures(date)
	if err != nil {
		log.Printf("Error while getting min low climate data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error while getting min low climate data",
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, minLowData)
}

func getAvgPrecipClimateData(c *gin.Context) {
    date := c.DefaultQuery("date", "2023-01-01")  // default to "2023-01-01" if not provided
    avgPrecipData, err := getAvgPrecipitation(date)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, avgPrecipData)
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
	router.GET("api/climate/avg", getAvgClimateData)
	router.GET("/api/climate/max-high", getMaxHighClimateData)
	router.GET("/api/climate/min-low", getMinLowClimateData)
	router.GET("/api/climate/avg-precip", getAvgPrecipClimateData)

	router.Run(":4000")
}
