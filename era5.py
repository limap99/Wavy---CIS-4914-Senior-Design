import cdsapi
import netCDF4
from netCDF4 import num2date
import numpy as np
import os
import pandas as pd
import requests
import xarray as xr
c = cdsapi.Client()
years =  [
           
           
           
           '2020','2019','2018','2021','2022'
] 
months = ['01', '02', '03',
            '04', '05', '06',
            '07', '08', '09',
            '10', '11', '12']
# var =[
#             '10m_u_component_of_wind', '10m_v_component_of_wind', '2m_dewpoint_temperature',
#             '2m_temperature', 'mean_wave_direction', 'mean_wave_period',
#             'sea_surface_temperature', 'significant_height_of_combined_wind_waves_and_swell', 'total_cloud_cover',
#             'total_precipitation',
#         ]
var=[
            '10m_u_component_of_wind', '10m_v_component_of_wind', '2m_dewpoint_temperature',
            '2m_temperature', 'total_precipitation',
        ]
stats=["daily_minimum","daily_maximum","daily_mean"]
variables = ['u10', 'v10', 'd2m', 't2m', 'mwd', 'mwp', 'sst', 'swh', 'tcc', 'tp']
file_location = './data.nc'

for yr in years:
    for month in months:
        result = c.retrieve(
             'reanalysis-era5-land',
    {
        'variable': [
            '10m_u_component_of_wind', '10m_v_component_of_wind', '2m_dewpoint_temperature',
            '2m_temperature', 'total_precipitation',
        ],
        'year': yr,
        'month': month,
        'day': [
            '01', '02', '03',
            '04', '05', '06',
            '07', '08', '09',
            '10', '11', '12',
            '13', '14', '15',
            '16', '17', '18',
            '19', '20', '21',
            '22', '23', '24',
            '25', '26', '27',
            '28', '29', '30',
        ],
        'time': [
            '00:00', '01:00', '02:00',
            '03:00', '04:00', '05:00',
            '06:00', '07:00', '08:00',
            '09:00', '10:00', '11:00',
            '12:00', '13:00', '14:00',
            '15:00', '16:00', '17:00',
            '18:00', '19:00', '20:00',
            '21:00', '22:00', '23:00',
        ],
        'area': [
            32, -88, 24,
            -80,
        ],
        'format': 'netcdf',
    },
            yr+'_'+month+'.nc')
        # file_name = "download_" + stat + "_" + var + "_" + yr + "_" + mn + ".nc"
        # file_name = "download_" + yr + ".nc"
        # location=result[0]['location']
        # res = requests.get(location, stream = True)

        # print("Writing data to " + file_name)
        # with open(file_name,'wb') as fh:
        #     for r in res.iter_content(chunk_size = 1024):
        #         fh.write(r)
        # print(f'{file_name} Retrieved Successfully!')
        # ds=xr.open_dataset(file_name)
        # df=ds.to_dataframe().reset_index()
        # df['month']=mn
        # dfs.append(df)

        # final_df = pd.concat(dfs)
        # final_df['geom'] = df.apply(lambda row: f'SRID=4326;POINT({row.longitude} {row.latitude})', axis=1)
        # csv_name = "download_" + yr + "_" + mn +".csv"
        # final_df.to_csv(csv_name, index=False)
        # print(f'Data for {yr}-{mn} saved to {csv_name}')
        
        


# f = netCDF4.Dataset('download.nc')
# print("Variables in the NetCDF file:", f.variables.keys())


# time_dim, lat_dim, lon_dim = f.dimensions['time'], f.dimensions['latitude'], f.dimensions['longitude']
# times = num2date(f.variables[time_dim.name][:], f.variables[time_dim.name].units)
# latitudes = f.variables[lat_dim.name][:]
# longitudes = f.variables[lon_dim.name][:]

# # Create grid for latitude, longitude, and time
# times_grid, latitudes_grid, longitudes_grid = np.meshgrid(times, latitudes, longitudes, indexing='ij')

# # Flatten the grid arrays
# flattened_data = {
#     'time': [t.isoformat() for t in times_grid.flatten()],
#     'latitude': latitudes_grid.flatten(),
#     'longitude': longitudes_grid.flatten(),
# }

# # Extract and flatten each variable, then add to the data dictionary
# for var_name in variables:
#     var = f.variables[var_name]
#     flattened_data[var_name] = var[:].flatten()

# # Create a DataFrame from the flattened data
# df = pd.DataFrame(flattened_data)

# # Write the DataFrame to a CSV file
# output_file = './output_data.csv'
# df.to_csv(output_file, index=False)
# print(f'Data written to {output_file}')