package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type Station struct {
	COUNTY        string  `json:"COUNTY"`
	STATION       string  `json:"STATION"`
	YEAR          int16   `json:"YEAR"`
	MONTH         int16   `json:"MONTH"`
	DAY           int16   `json:"DAY"`
	PRECIPITATION float32 `json:"PRECIPITATION"`
	MAX_TEMP      float32 `json:"MAX_TEMP"`
	MIN_TEMP      float32 `json:"MIN_TEMP"`
	MEAN_TEMP     float32 `json:"MEAN_TEMP"`
	COOPID        int     `json:"COOPID"`
}

func fetchDataFromSupabase(supabaseURL, serviceKey string) ([]Station, error) {
	url := supabaseURL + "/rest/v1/Stations"

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

	// Print raw response for debugging
	fmt.Println("Response from Supabase:", string(body))

	// Check the HTTP status code
	if resp.StatusCode != http.StatusOK {
		fmt.Println("Error Response from Supabase:", string(body))
		return nil, fmt.Errorf("unexpected status code: %v", resp.Status)
	}

	var stations []Station
	if err := json.Unmarshal(body, &stations); err != nil {
		return nil, fmt.Errorf("error unmarshalling data: %v", err)
	}

	return stations, nil
}

func getAllStationData(c *gin.Context) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	serviceKey := os.Getenv("SERVICE_KEY")

	stationData, err := fetchDataFromSupabase(supabaseURL, serviceKey)
	if err != nil {
		log.Printf("Error while getting all station data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error while getting all station data",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, stationData)
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
	router.GET("/api/stations/", getAllStationData)
	router.Run(":3000")
}
