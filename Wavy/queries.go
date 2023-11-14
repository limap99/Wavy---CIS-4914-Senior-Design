package main

const QuerySelectAllClimateData = `
SELECT 
	time, latitude, longitude, u10_min, u10_mean, u10_max,
	v10_min, v10_mean, v10_max, d2m_min, d2m_mean, d2m_max,
	t2m_min, t2m_mean, t2m_max, tcc_min, tcc_mean, tcc_max,
	mwd_mean, mwp_mean, sst_mean, swh_mean, tp_eod
FROM 
	era5_refined;
`

const QueryAvgTemperatures = `
    SELECT 
        latitude,
        longitude,
        AVG(t2m_mean) AS t2m_mean
    FROM 
        era5_refined
    WHERE
        time >= $1 AND time < $1::date + INTERVAL '1 day'
    GROUP BY 
        latitude, longitude;
`

const QueryMaxHighClimateData = `
    SELECT 
        latitude AS Lat,
        longitude AS Long,
        MAX(t2m_max) AS Max_Daily_High
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
        MIN(t2m_min) AS Min_Daily_Low
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
        MAX(tp_eod) AS TpEod
    FROM 
        era5_refined
    WHERE 
        time = $1
    GROUP BY
        time, latitude, longitude;
`

const QueryWindSpeedGroupedByLocation = `
    SELECT 
        time, latitude, longitude, AVG(u10_mean) AS avg_u10_mean, AVG(v10_mean) AS avg_v10_mean
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
        AVG(swh_mean) AS Mean_Sea_Wave_Height
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
        AVG(tcc_mean) AS Total_Cloud_Cover
    FROM 
        era5_refined
	WHERE
		time = $1
    GROUP BY 
        latitude, longitude;
`
