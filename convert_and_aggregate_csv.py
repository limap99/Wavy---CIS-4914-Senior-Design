import xarray as xr
import pandas as pd
from tqdm import tqdm
import numpy as np;

print("This is the start of the daily conversion and aggregation script")
years =  [
        #    '1980','1981','1982',
        #    '1983','1984','1985',
        #    '1986','1987','1988',
        #    '1989','1990','1991',
        #    '1992','1993','1994',
        #    '1995','1996','1997',
        #    '1998','1999',
        #    '2000', '2001', '2002',
        #    '2003', '2004', '2005',
        #    '2006', '2007', '2008',
        #    '2009', '2010', '2011',
        #    '2012', '2013', '2014',
        #    '2015', '2016', '2017',
        #    '2018','2019','2020',
           #'2021',
           '2022'
] 
for yr in years:
    print(yr)
    file_name = "download" + yr + ".nc"
    # Open the NetCDF file
    ds = xr.open_dataset(file_name)

    print("converting windspeed to kts and deg")
    u = ds['u10']
    v = ds['v10']
    ds['wind_speed'] = (u**2 + v**2)**0.5 * 1.94384  # Convert m/s to knots
    ds['wind_direction'] = (270 - (180/np.pi) * np.arctan2(v, u)) % 360

    ds = ds.drop(['u10', 'v10'])

    print("converting temperature to F")
    ds['t2m'] = (ds['t2m'] - 273.15) * 9/5 + 32  # Convert Kelvin to Fahrenheit

    print('converting dpt to F')
    ds['d2m'] = (ds['d2m']-273.15) * 9/5 + 32
    print('converting sst to F')
    ds['sst'] = (ds['sst']-273.15) * 9/5 + 32
    print("converting waveheight to ft")
    # Example: Convert wave height from meters to feet
    ds['swh'] = ds['swh'] * 3.28084  # Convert meters to feet

    print("converting tp to inches")
    ds['tp'] = ds['tp']*39.3701

    # Variables to calculate daily mean
    mean_vars = ['mwd', 'mwp', 'sst', 'swh','wind_speed','wind_direction']

    # Variables to calculate daily min, mean, max
    min_mean_max_vars = ['d2m', 't2m', 'tcc']

    # Variable to get value at the end of the day
    end_of_day_vars = ['tp']

    # Create an empty list to store data frames
    dfs = []

    # Function to drop columns if they exist
    def drop_columns(df, columns):
        return df.drop(columns=[col for col in columns if col in df.columns])

    # Calculate daily mean for specified variables
    for var in mean_vars:
        if var in ds:
            print(f'Processing {var} (daily mean)...')
            daily_mean = ds[var].resample(time='1D').mean()
            df_mean = daily_mean.to_dataframe(name=f'{var}_mean').reset_index()
            dfs.append(df_mean)
        else:
            print(f'Variable {var} not found in dataset')

    # Calculate daily min, mean, max for specified variables
    for var in min_mean_max_vars:
        if var in ds:
            print(f'Processing {var} (daily min, mean, max)...')
            daily_min = ds[var].resample(time='1D').min()
            daily_mean = ds[var].resample(time='1D').mean()
            daily_max = ds[var].resample(time='1D').max()
            df = pd.concat([
                daily_min.to_dataframe(name=f'{var}_min').reset_index(),
                drop_columns(daily_mean.to_dataframe(name=f'{var}_mean').reset_index(), ['time', 'latitude', 'longitude']),
                drop_columns(daily_max.to_dataframe(name=f'{var}_max').reset_index(), ['time', 'latitude', 'longitude']),
            ], axis=1)
            dfs.append(df)
        else:
            print(f'Variable {var} not found in dataset')

    # print('converting wind...')
    # umin = df['u10_min']
    # umean = df['u10_mean']
    # umax = df['u10_max']
    
    # vmin = df['v10_min']
    # vmean = df['v10_mean']
    # vmax = df['v10_max']

    # ds['wind_speed_min'] = (umin)
    # Get value at the end of the day for tp
    for var in end_of_day_vars:
        if var in ds:
            print(f'Processing {var} (sum of day)...')
            #end_of_day = ds[var].resample(time='1D').last()
            sum_of_day = ds[var].resample(time='1D').sum()
            #df_end_of_day = end_of_day.to_dataframe(name=f'{var}_eod').reset_index()
            #dfs.append(df_end_of_day)
            df_sum_of_day = sum_of_day.to_dataframe(name=f'{var}_sum').reset_index()
            dfs.append(df_sum_of_day)
        else:
            print(f'Variable {var} not found in dataset')

    # Merge all data frames on time, latitude, and longitude
    print("Merging")
    final_df = pd.concat(dfs, axis=1)
    final_df = final_df.loc[:,~final_df.columns.duplicated()]

    # print("Adding postgis support")
    # # Add PostGIS geom column
    # num_rows = final_df.shape[0]
    # final_df['geom'] = tqdm(final_df.apply(lambda row: f'SRID=4326;POINT({row.longitude} {row.latitude})', axis=1), total=num_rows)

    # # Specify CSV file name
    # csv_name = "CSV/converted/withPOST"+ yr + "POST.csv"
    csv_name="CUMSUM_test"+yr+".csv"
    # Save to CSV
    print("Saving")
    final_df.to_csv(csv_name, index=False)
    print(f'Data saved to {csv_name}')
