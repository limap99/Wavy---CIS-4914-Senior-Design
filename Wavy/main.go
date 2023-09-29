package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"

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

func fetchDataFromSupabase(supabaseURL, serviceKey, county string, startDay, startMonth, startYear, endDay, endMonth, endYear int16) ([]Station, error) {
	baseURL := fmt.Sprintf("%s/rest/v1/Stations?select=*", supabaseURL)

	var requestURL string

	if county != "" {
		county = url.QueryEscape(county)
		requestURL = fmt.Sprintf("%s&COUNTY=eq.%s", baseURL, county)
	} else {
		requestURL = baseURL
	}

	// Add date conditions only if startYear is provided
	if startYear != 0 {
		startDateCondition := fmt.Sprintf("YEAR=gte.%d&MONTH=gte.%d&DAY=gte.%d", startYear, startMonth, startDay)
		endDateCondition := fmt.Sprintf("YEAR=lte.%d&MONTH=lte.%d&DAY=lte.%d", endYear, endMonth, endDay)

		requestURL = fmt.Sprintf("%s&%s&%s", requestURL, startDateCondition, endDateCondition)
	}

	fmt.Println("Constructed URL:", requestURL)

	req, err := http.NewRequest("GET", requestURL, nil)
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

	if resp.StatusCode != http.StatusOK {
		bodyStr := string(body)
		fmt.Println("Error Response from Supabase:", bodyStr)
		return nil, fmt.Errorf("unexpected status code: %v - %s", resp.Status, bodyStr)
	}

	var stations []Station
	if err := json.Unmarshal(body, &stations); err != nil {
		return nil, fmt.Errorf("error unmarshalling data: %v", err)
	}

	// if no date filters are provided, return all fetched stations
	if startDay == 0 && startMonth == 0 && startYear == 0 && endDay == 0 && endMonth == 0 && endYear == 0 {
		return stations, nil
	}

	var filteredStations []Station
	for _, station := range stations {
		dateOfRecord := time.Date(int(station.YEAR), time.Month(station.MONTH), int(station.DAY), 0, 0, 0, 0, time.UTC)
		startDate := time.Date(int(startYear), time.Month(startMonth), int(startDay), 0, 0, 0, 0, time.UTC)
		endDate := time.Date(int(endYear), time.Month(endMonth), int(endDay), 0, 0, 0, 0, time.UTC)

		if (dateOfRecord.Equal(startDate) || dateOfRecord.After(startDate)) && (dateOfRecord.Equal(endDate) || dateOfRecord.Before(endDate)) {
			filteredStations = append(filteredStations, station)
		}
	}

	return filteredStations, nil
}

func getAllStationData(c *gin.Context) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	serviceKey := os.Getenv("SERVICE_KEY")

	county := c.Query("county")

	// Only parse start and end dates if they are provided
	var startDay, startMonth, startYear, endDay, endMonth, endYear int64

	if c.Query("startDay") != "" && c.Query("startMonth") != "" && c.Query("startYear") != "" {
		startDay, _ = strconv.ParseInt(c.Query("startDay"), 10, 16)
		startMonth, _ = strconv.ParseInt(c.Query("startMonth"), 10, 16)
		startYear, _ = strconv.ParseInt(c.Query("startYear"), 10, 16)

		// If endDay, endMonth, or endYear is not provided, use startDay, startMonth, and startYear
		endDay, _ = strconv.ParseInt(c.DefaultQuery("endDay", strconv.FormatInt(startDay, 10)), 10, 16)
		endMonth, _ = strconv.ParseInt(c.DefaultQuery("endMonth", strconv.FormatInt(startMonth, 10)), 10, 16)
		endYear, _ = strconv.ParseInt(c.DefaultQuery("endYear", strconv.FormatInt(startYear, 10)), 10, 16)
	}

	stationData, err := fetchDataFromSupabase(supabaseURL, serviceKey, county, int16(startDay), int16(startMonth), int16(startYear), int16(endDay), int16(endMonth), int16(endYear))
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
