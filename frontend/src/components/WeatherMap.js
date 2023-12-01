import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import L, { rectangle } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FloridaCountiesData } from '../data/FloridaCountiesData';
import * as turf from '@turf/turf';
import { grids, coordinatesToBeQueried } from '../data/gridData';
import TemperatureRect from './TemperatureRect';
import WindRect from './WindRect';
import WaveRect from './WaveRect';
import ReactDOM from 'react-dom';
import PrecipitationRect from './PrecipitationRect';
import { format } from 'date-fns';
import AutoDateComponent from './AutoDateComponent';
import TimelineAverageRuler from './TimelineAverageRuler';
import TimelineYearRuler from './TimelineYearRuler';
import MapView from './MapView';
import DatePickerComponent from './DatePickerComponent';





 
 
const WeatherMap = () => { 

  
    const [currentMetric, setCurrentMetric] = useState('avg_temp');
    const [selectedDate, setSelectedDate] = useState(new Date(2022, 0, 1));
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedTimelineDate, setSelectedTimelineDate] = useState(new Date(2022, 0, 1))
    const [mapView, setMapView] = useState('date');
    const [height, setHeight] = useState(80);
    const [data, setData] = useState(null);
    const [dataLoaded, setDataLoad] = useState(false);


  let map = null

  

  let metricsLayer = null;
  let port = 4001
  let apiUrl;
   
 

  const getApiUrl = (metric, date, mapView) => {
    switch (metric) {
      case 'avg_temp':
        if(mapView === 'date'){
          apiUrl = `http://localhost:${port}/api/climate/avg?time=${date} 00:00:00`
        }
        else if (mapView === 'average'){
          apiUrl = `http://localhost:${port}/api/climate/temp-40-avg?month=${date.slice(5,7)}&day=${date.slice(8, 10)}`

        }
        return apiUrl;
      case 'min_temp':
        if(mapView === 'date'){
          apiUrl = `http://localhost:${port}/api/climate/min-low?time=${date} 00:00:00`
        }
        else if (mapView === 'average'){
          apiUrl = `http://localhost:${port}/api/climate/min-low-40-avg?month=${date.slice(5,7)}&day=${date.slice(8, 10)}`

        }
        return apiUrl;
      case 'max_temp':
        if(mapView === 'date'){
          apiUrl = `http://localhost:${port}/api/climate/max-high?time=${date} 00:00:00`
        }
        else if (mapView === 'average'){
          apiUrl = `http://localhost:${port}/api/climate/max-high-40-avg?month=${date.slice(5,7)}&day=${date.slice(8, 10)}`

        }
        return apiUrl;
      case 'wind':
        if(mapView === 'date'){
          apiUrl = `http://localhost:${port}/api/climate/windspeed?time=${date} 00:00:00`;
        }
        else if (mapView === 'average'){
          apiUrl = `http://localhost:${port}/api/climate/windspeed-40-avg?month=${date.slice(5,7)}&day=${date.slice(8, 10)}`

        }
        return apiUrl
      case 'precipitation':
        if(mapView === 'date'){
          apiUrl = `http://localhost:${port}/api/climate/precipitation?time=${date} 00:00:00`;
        }
        else if (mapView === 'average'){
          apiUrl = `http://localhost:${port}/api/climate/precipitation-40-avg?month=${date.slice(5,7)}&day=${date.slice(8, 10)}`

        }
        return apiUrl
      case 'clouds':
          return `http://localhost:${port}/api/climate/cloudcover?time=${date} 00:00:00`;
      default:
        return `http://localhost:${port}/api/climate/precipitation?time=${date}00:00:00`;
    }
  };



  const onDateChange = (date) => {
    setSelectedDate(date);
  };
  const onMapViewChange = (mapView) => {
    setMapView(mapView)
    if(mapView === 'average'){
      setSelectedDate(new Date(2020, 0, 1))
    }
    else{
      setSelectedDate(new Date(2022, 0, 1))

    }
  };
  const onTimelineDateChange = (date) => {
    setSelectedTimelineDate(date);
  };

  


    const getColor = (value) => {
        if (currentMetric === 'precipitation') {
          // ... add logic for precipitation colors
          return value > 0.2 ? '#0033CC' : // Very Wet
          value > 0.1 ? '#3366FF' : // Wet
          value > 0.07? '#6699FF' : // Moderate
          value > 0.03  ? '#99CCFF' :
          value > 0.02  ? '#CCE5FF' :
          value > 0.01  ? '#E5F2FF' :
                     '#F0F8FF'; // Dry
        }
        else if (currentMetric === 'wind') {
          return value > 40 ? '#810f7c' : 
          value > 30 ? '#8856a7' : 
          value > 20 ? '#8c96c6' : 
          value > 15  ? '#9ebcda' :
          value > 10  ? '#bfd3e6' :
          // value > 15  ? '#bfd3e6' :
          // value > 10  ? '#e0ecf4' :
                     '#b6e5f2'; 
        }

        else if (currentMetric === 'clouds') {
          return value > 90 ? '#f6eff7' : 
          value > 70 ? '#d0d1e6' : 
          value > 50 ? '#a6bddb' : 
          value > 30  ? '#67a9cf' :
          value > 20  ? '#1c9099' :
          // value > 15  ? '#bfd3e6' :
          // value > 10  ? '#e0ecf4' :
                     '#016c59'; 
        }

        else {
          // ... your existing temperature colors logic
          return value > 90 ? '#800026' : // Very hot
              value > 80 ? '#BD0026' : // Hot
              value > 70 ? '#E31A1C' : // Warm
              value> 60 ? '#FC4E2A' :
              value > 50 ? '#FD8D3C' :
              value > 40  ? '#FEB24C' :
              value> 30 ? '#FED976' :
                          '#d8a6268c';
        } 
      };

    const style = (feature) => {
        return {
        fillColor: getColor(feature.properties[currentMetric]),
        //fillColor: 'red',
        weight: 0,
        //weight: 2,
        opacity: 1,
        color: '#667',  // This should hide any remaining border
        dashArray: '3',
        fillOpacity: 0.7,
        };
    };

    const countyStyle = (feature) => {
        return {
        // fillColor: getColor(feature.properties[currentMetric]),
        fillColor: '',
        //weight: 0,
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.0
        };
    };

    const gridStyle = (feature) => {
      return {
      // fillColor: getColor(feature.properties[currentMetric]),
      fillColor: '',
      //weight: 0,
      weight: 0,
      pointerEvents: 'none',


      
     
      fillOpacity: 0.0
      };
  };

  


    const highlightFeature = (e) => {
        const layer = e.target;
    


        layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.0
        });
    
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          layer.bringToFront();
        }

        info.update(layer.feature.properties)
        layer.redraw();
    };

    const resetHighlight = (e) => {
        const layer = e.target;
  
        layer.setStyle({
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.0
        })
        
        
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        info.update();
        layer.redraw();
        
    };
    
    
    const showPopup = (e, layer) => {
      const metric = layer.feature.properties[currentMetric];
      if (currentMetric === "precipitation") {
          layer.bindPopup(`${metric} in`).openPopup();
      } else if (currentMetric === "wind"){
        layer.bindPopup(`${metric} mph`).openPopup();
      }else if (currentMetric === "clouds"){
        layer.bindPopup(`${metric}%`).openPopup();
      }else {
          layer.bindPopup(`${metric}°F`).openPopup();
      }
  };
    

        const onEachFeatureGrid = (feature, layer) => {
          layer.on({
              click: (e) => showPopup(e, layer)
          });
      };

        const onEachFeature = (feature, layer) => {
        layer.on({
        
            
            
            mouseover: (e) => highlightFeature(e, info),
            mouseout: (e) => resetHighlight(e, info, currentMetric),
            
        });
    };
  

    let info;

    let formattedDate;

    if(isPlaying){
      formattedDate = format(selectedTimelineDate, 'yyyy-MM-dd')
    }
    else{
      formattedDate = format(selectedDate, 'yyyy-MM-dd')
    }

    


  useEffect(() => {
    let api_url = getApiUrl(currentMetric, formattedDate, mapView);
    fetch(api_url)
            .then(response => response.json())
            .then(data => {
              setData(data);
              setDataLoad(true);
              
              for(let i = 0; i < grids.length; i++){
                for(let j = 0; j < data.length; j++){
                  if(grids[i].gridCenter[0] === data[j].Long && grids[i].gridCenter[1] === data[j].Lat){

                      if(currentMetric === 'wind'){
                        let metricValue = Object.values(data[j])[4]
                        grids[i].properties[currentMetric]= metricValue 
                        grids[i].wind_direction = data[j].wind_direction_mean
                      }
                
                      else if(currentMetric === 'precipitation'){
                        let metricValue = Object.values(data[j])[3]
                        grids[i].properties[currentMetric]= Math.round(metricValue * 1000) / 1000
                      }
                      else{
                        let metricValue = Object.values(data[j])[2]
                        if(currentMetric === 'clouds'){
                          metricValue = metricValue * 100
                        }
                        grids[i].properties[currentMetric]= metricValue 
                      }

                      
                    break; 
                  }        
                }
              }
 
             
              metricsLayer = L.geoJSON(turf.featureCollection(grids), {
                style: style,
    
            }).addTo(map);

            if(currentMetric === 'wind'){
              grids.forEach(grid => {
                const icon = L.divIcon({
                  html: `<div class="fas fa-arrow-right" style="transform: rotate(${grid.wind_direction}deg);"></div>`, // Your custom HTML for the icon
                  iconSize: [15, 15], // Size of the icon
                  iconAnchor: [0, 0], // Point of the icon which will correspond to marker's location
                  className: 'custom-div-icon' // Custom class for additional styling
                });
              
                L.marker([grid.gridCenter[1], grid.gridCenter[0]], {icon: icon})
                  .addTo(map);
              });
            }
          
            geoJsonLayer = L.geoJSON(FloridaCountiesData, {
              style: countyStyle,
              onEachFeature: onEachFeature,
          }).addTo(map);

          map.on('click', function(e) {
            const clickedPoint = turf.point([e.latlng.lng, e.latlng.lat]);
            metricsLayer.eachLayer(layer => {
                if (turf.booleanPointInPolygon(clickedPoint, layer.feature)) {
                    showPopup(e, layer);
                }
            });
        });
        

            })


            .catch(error => console.error('Error fetching data:', error));
  

    let geoJsonLayer = null;

  
    
    const mapContainer = document.getElementById('map');
    
    




    const bounds = [
        [14.392411, -100.185547], // Southwest coordinates
        [33.110291, -40.117188]  // Northeast coordinates
      ];

      
    
    if (!mapContainer._leaflet_id) {
      map = L.map('map', {
        attributionControl: false,
        minZoom: 7,
        maxBounds: bounds,  // Limit the pannable area
        maxBoundsViscosity: 0.75
      }).setView([27.5, -82], 7);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
 

      info = L.control();

      info.onAdd = function(){
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        this._div.style.marginTop= '`1.5rem';

        return this._div;
      }

      info.update = function (props){

        this._div.innerHTML = '<h4>Location </h4>' + (props ?
          '<b>' + props.name + '</b><br />' :
          'Hover over a county');
        
      }

      info.addTo(map);





    }

    // Adding buttons to the map
     const customControl = L.Control.extend({
      

        options: {
          position: 'topright'
        },

        onAdd: function () {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
          container.style.display = 'flex';
          container.style.flexDirection = 'column';  // Vertically align the buttons
          container.style.top = "50%"; // Position it in the middle vertically
          container.style.marginTop = '8em';
          container.style.marginRight = '1rem';



      
          
        container.innerHTML = `
      <div class="map-icon" style="display: flex; align-items: center; margin-bottom: 20px; cursor: pointer;" onclick="window.switchMetric('avg_temp')">
        <i class="fas fa-thermometer-half" style="font-size: 24px; color: #FFA500"></i>
        <span style="margin-left: 8px;  font-weight: bold" >Average Temperature</span>
      </div>
      <div class="map-icon" style="display: flex; align-items: center; margin-bottom: 20px; cursor: pointer;" onclick="window.switchMetric('min_temp')">
        <i class="fas fa-thermometer-empty" style="font-size: 24px; color: #0000FF"></i>
        <span style="margin-left: 8px; font-weight: bold">Minimum Temperature</span>
      </div>
      <div class="map-icon" style="display: flex; align-items: center; margin-bottom: 20px; cursor: pointer;" onclick="window.switchMetric('max_temp')">
        <i class="fas fa-thermometer-full" style="font-size: 24px; color: #FF0000"></i>
        <span style="margin-left: 8px; font-weight: bold">Maximum Temperature</span>
      </div>
      <div class="map-icon" style="display: flex; align-items: center; margin-bottom: 20px; cursor: pointer;" onclick="window.switchMetric('precipitation')">
        <i class="fas fa-cloud-rain" style="font-size: 20px; color: #0f2e8a"></i>
        <span style="margin-left: 8px;  font-weight: bold">Average Precipitation</span>
      </div>
      <div class="map-icon" style="display: flex; text-align: center; align-items: center; margin-bottom: 20px; cursor: pointer;" onclick="window.switchMetric('wind')">
      <i class="fas fa-wind" style="font-size: 20px; color: #097d9f"></i>
        <span style="margin-left: 8px;  font-weight: bold">Wind Speed and Direction</span>
      </div>
      <div class="map-icon" style="display: flex; text-align: center; align-items: center; margin-bottom: 20px; cursor: pointer;" onclick="window.switchMetric('clouds')">
      <i class="fas fa-cloud" style="font-size: 20px; color: #097d9f"></i>
        <span style="margin-left: 8px;  font-weight: bold">Cloud Cover</span>
      </div>
      
    `;


  
          return container;
        }
      });

      const tempMeter = L.Control.extend({
      

        options: {
          position: 'topright'
        },

        onAdd: function () {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
          



        // Create a div element to render the TemperatureRect component
        const temperatureRectComponent = document.createElement('div');
        const precipitationRectComponent = document.createElement('div');
        const windRectComponent = document.createElement('div');
        const waveRectComponent = document.createElement('div');

        const rootTemp = createRoot(temperatureRectComponent)
        const rootPrep = createRoot(precipitationRectComponent)
        const rootWind = createRoot(windRectComponent)
        const rootWave = createRoot(waveRectComponent)

        
        rootTemp.render(<TemperatureRect />);
        rootPrep.render(<PrecipitationRect />);
        rootWind.render(<WindRect />);
        rootWave.render(<WaveRect />);
        
        
        if(currentMetric === 'precipitation'){
          container.appendChild(precipitationRectComponent);
        }

        else if(currentMetric === 'wind'){
          container.appendChild(windRectComponent)
        }
        else if(currentMetric === 'clouds'){
          container.appendChild(waveRectComponent)
        }
        
        else{
          container.appendChild(temperatureRectComponent);
        }
        
  
          return container;
        }
      });

      const DateSelector = L.Control.extend({
      

        options: {
          position: 'topleft'
        },

        onAdd: function () {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
          



        // Create a div element to render the TemperatureRect component
        const DateSelectorComponent= document.createElement('div');
        
        const root = createRoot(DateSelectorComponent)

        root.render(<DatePickerComponent selectedDate={selectedDate} 
          onDateChange={onDateChange} mapView={mapView}/>) 

        
    
        container.appendChild(DateSelectorComponent);
        
        
      
        
  
          return container;
        }
      });

      const MapViewSelector = L.Control.extend({
      

        options: {
          position: 'topleft'
        },

        onAdd: function () {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
          



        // Create a div element to render the TemperatureRect component
        const MapViewComponent= document.createElement('div');
        
        const root = createRoot(MapViewComponent)

        root.render(<MapView onMapViewChange={onMapViewChange} />)

        
    
        container.appendChild(MapViewComponent);
        
        
      
        
  
          return container;
        }
      });



  
     map.addControl(new customControl());

     map.addControl(new DateSelector());
     
     map.addControl(new tempMeter());

     
  
      // Expose function to window object so it can be accessed by inline onclick handlers
      window.switchMetric = (newMetric) => {
        setCurrentMetric(newMetric);
             
      };

    

      

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [currentMetric, selectedDate, mapView]);







  return (
   


    // </div>
      <div style={{ height: '100%', width: '100%', position: 'relative' }}>
              <MapView  onMapViewChange={onMapViewChange} style={{ height: '3%', position: 'absolute', top: 0, left: 0, zIndex: 1000, background: '#416892b0' }} />
              <div id="map" style={{ height: `${height}%`, width: '100%', position: 'relative' }}> </div>
              {/* <TimelineRuler date={selectedDate} onDateChange={onDateChange} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }} /> */}
              { mapView === 'date' && <TimelineYearRuler  date={selectedDate} onDateChange={onDateChange} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }} />}
              { mapView === 'average' && <TimelineAverageRuler  date={selectedDate} onDateChange={onDateChange} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }} />}





      </div>

    
   
  );
}

export default WeatherMap;
