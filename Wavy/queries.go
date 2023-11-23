package main

//
// ERA5_Refined Queries
//

const QuerySelectAllClimateData = `
SELECT 
	time, latitude, longitude, mwd_mean, mwp_mean, sst_mean, swh_mean, d2m_min, d2m_mean, d2m_max, 
	t2m_min, t2m_mean, t2m_max, tcc_min, tcc_mean, tcc_max, tp_eod,
	wind_speed_mean, wind_direction_mean, wind_speed_min, wind_direction_min, wind_speed_max, wind_direction_max
FROM 
	era5_refined;
`

const QueryAvgTemperatures = `
    SELECT 
        latitude AS Lat,
        longitude AS Long,
        ROUND(AVG(t2m_mean), 1) AS t2m_mean
    FROM 
        era5_refined
    WHERE
        time = $1
    GROUP BY 
        latitude, longitude;
`

const QueryLatitudeLongitude = `
    SELECT
        latitude as Lat, 
        longitude as Long
    FROM 
        era5_refined
    GROUP BY 
        latitude, longitude
`

const QueryMaxHighClimateData = `
    SELECT 
        latitude AS Lat,
        longitude AS Long,
        ROUND(MAX(t2m_max), 1) AS Max_Daily_High
    FROM 
        era5_refined
    WHERE
        time = $1
    GROUP BY 
        latitude, longitude;
`

const QueryMinLowClimateData = `
    SELECT 
        latitude AS Lat,
        longitude AS Long,
        ROUND(MIN(t2m_min),1) AS Min_Daily_Low
    FROM 
        era5_refined
	WHERE 
		time = $1
    GROUP BY 
        latitude, longitude;
`

const QueryPrecipitationData = `
    SELECT 
        time,
        latitude AS Lat,
        longitude AS Long,
       MAX(tp_sum) AS TpEod
    FROM 
        era5_refined
    WHERE 
        time = $1
    GROUP BY
        time, latitude, longitude;
`

const QueryWindSpeedGroupedByLocation = `
    SELECT 
        time, latitude, longitude, ROUND(AVG(wind_direction_mean),1) AS WindDirectionMean,
        ROUND(AVG(wind_speed_mean),1) AS WindSpeedMean
    FROM 
        era5_refined
    WHERE
        time = $1
    GROUP BY
        time, latitude, longitude;
`

const QueryMeanSeaWaveHeight = `
    SELECT 
        latitude AS Lat,
        longitude AS Long,
        ROUND(AVG(swh_mean),1) AS Mean_Sea_Wave_Height
    FROM 
        era5_refined
	WHERE
		time = $1
    GROUP BY 
        latitude, longitude;
`

const QueryMeanCloudCover = `
    SELECT 
        latitude AS Lat,
        longitude AS Long,
        ROUND(AVG(tcc_mean),1) AS Total_Cloud_Cover
    FROM 
        era5_refined
	WHERE
		time = $1
    GROUP BY 
        latitude, longitude;
`

//
// ERA5_Average Queries
//

const QueryAvgTemperaturesAverage = `
    SELECT 
        latitude AS Lat,
        longitude AS Long,
        ROUND(AVG(t2m_mean),1) AS t2m_mean
    FROM 
        era5_averages
    GROUP BY 
        latitude, longitude;
`

const QueryMaxHighClimateDataAverage = `
    SELECT 
        latitude AS Lat,
        longitude AS Long,
        ROUND(MAX(t2m_max),1) AS Max_Daily_High
    FROM 
        era5_averages
    GROUP BY 
        latitude, longitude;
`

const QueryMinLowClimateDataAverage = `
    SELECT 
        latitude AS Lat,
        longitude AS Long,
        ROUND(MIN(t2m_min),1) AS Min_Daily_Low
    FROM 
        era5_averages
    GROUP BY 
        latitude, longitude;
`

const QueryPrecipitationDataAverage = `
    SELECT 
        time,
        latitude AS Lat,
        longitude AS Long,
        MAX(tp_eod) AS TpEod
    FROM 
        era5_averages
    GROUP BY
        time, latitude, longitude;
`

const QueryWindSpeedGroupedByLocationAverage = `
    SELECT 
        latitude AS Lat,
        longitude as Long,
        ROUND(AVG(v10_mean),1) AS WindDirectionMean,
        ROUND(AVG(u10_mean),1) AS WindSpeedMean
    FROM 
        era5_averages
    GROUP BY
        time, latitude, longitude;
`
