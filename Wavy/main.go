package main

import (
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

	// Print raw response for debugging
	fmt.Println("Response from Supabase:", string(body))

	// Check the HTTP status code
	if resp.StatusCode != http.StatusOK {
		fmt.Println("Error Response from Supabase:", string(body))
		return nil, fmt.Errorf("unexpected status code: %v", resp.Status)
	}

	var data []ClimateData
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("error unmarshalling data: %v", err)
	}

	return data, nil
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
	router.Run(":4000")
}
