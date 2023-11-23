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
import TimelineDayRuler from './TimelineDayRuler';
import TimelineYearRuler from './TimelineYearRuler';
import TimelineRuler from './TimelineRuler';

import DatePickerComponent from './DatePickerComponent';





 
 
const WeatherMap = () => { 

  
    const [currentMetric, setCurrentMetric] = useState('avg_temp');
    const [selectedDate, setSelectedDate] = useState(new Date(2022, 0, 1));
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedTimelineDate, setSelectedTimelineDate] = useState(new Date(2022, 0, 1))
    const [data, setData] = useState(null);
    const [dataLoaded, setDataLoad] = useState(false);


  let map = null
  

  let metricsLayer = null;
  let port = 4001
   

  const getApiUrl = (metric, date) => {
    switch (metric) {
      case 'avg_temp':
        return `http://localhost:${port}/api/climate/avg?time=${date} 00:00:00`;
      case 'min_temp':
        return `http://localhost:${port}/api/climate/min-low?time=${date} 00:00:00`;
      case 'max_temp':
        return `http://localhost:${port}/api/climate/max-high?time=${date} 00:00:00`;
      case 'wind':
        return `http://localhost:${port}/api/climate/windspeed?time=${date} 00:00:00`;
      case 'precipitation':
          return `http://localhost:${port}/api/climate/precipitation?time=${date} 00:00:00`;
      case 'clouds':
          return `http://localhost:${port}/api/climate/cloudcover?time=${date} 00:00:00`;
      default:
        return `http://localhost:${port}/api/climate/precipitation?time=${date}00:00:00`;
    }
  };



  const onDateChange = (date) => {
    setSelectedDate(date);
    //setSelectedTimelineDate(date);
  };
  const onTimelineDateChange = (date) => {
    console.log('DATEE' + date)
    setSelectedTimelineDate(date);
    console.log('Timeline DATE Changed')
    console.log(selectedTimelineDate)
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    console.log('KSFLSD')
    if(!isPlaying){
      setSelectedDate(selectedTimelineDate)
    }
  };


  // const onDateChange = (date) => {
  //   setSelectedDate(date);
  //   setSelectedTimelineDate(date);
  // };
  // const onTimelineDateChange = (date) => {
  //   setSelectedTimelineDate(date);
  // };

  // const handlePlayPause = () => {
  //   setIsPlaying(!isPlaying);
  //   if(!isPlaying){
  //     setSelectedDate(selectedTimelineDate)
  //   }
  // };

  // if(isPlaying){
  //   console.log('ISPLAYING')
  // }
  


    const getColor = (value) => {
        if (currentMetric === 'precipitation') {
          // ... add logic for precipitation colors
          return value > 0.2 ? '#0033CC' : // Very Wet
          value > 0.1 ? '#3366FF' : // Wet
          value > 0.07? '#6699FF' : // Moderate
          value > 0.03  ? '#99CCFF' :
          value > 0.02  ? '#CCE5FF' :
          value > 0.015  ? '#E5F2FF' :
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
          return value > 5 ? '#016c59' : 
          value > 4 ? '#1c9099' : 
          value > 3 ? '#67a9cf' : 
          value > 2  ? '#a6bddb' :
          value > 1  ? '#d0d1e6' :
          // value > 15  ? '#bfd3e6' :
          // value > 10  ? '#e0ecf4' :
                     '#f6eff7'; 
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
        // layer.setStyle({
        //     fillColor: getColor(layer.feature.properties[currentMetric]),
        //     weight: 2,
        //     opacity: 1,
        //     color: 'white',
        //     dashArray: '3',
        //     fillOpacity: 0.7
        // })
        layer.setStyle({
            //fillColor: getColor(layer.feature.properties[currentMetric]),
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
    //let formattedDate = null
    // if(isPlaying){
    //   formattedDate = format(selectedTimelineDate, 'yyyy-MM-dd')
    // }
    // else{
    //   formattedDate = format(selectedTimelineDate, 'yyyy-MM-dd')
    // }
    //formattedDate = format(selectedDate, 'yyyy-MM-dd')
    let api_url = getApiUrl(currentMetric, formattedDate);
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
                      // else if(currentMetric === 'waves' && data[j].mean_sea_wave_height > 0){
                      //   let metricValue = Object.values(data[j])[2]
                      //   grids[i].properties[currentMetric]= metricValue 
                      // }
                      else if(currentMetric === 'precipitation'){
                        let metricValue = Object.values(data[j])[3]
                        grids[i].properties[currentMetric]= Math.round(metricValue * 10000) / 10000
                      }
                      else{
                        let metricValue = Object.values(data[j])[2]
                        if(currentMetric == 'clouds'){
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
                // onEachFeature: onEachFeature,
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

        // if(currentMetric === 'wind'){
        //   grids.forEach(grid => {
        //     const icon = L.divIcon({
        //       html: `<div class="fas fa-arrow-right" style="transform: rotate(${grid.wind_direction}deg);"></div>`, // Your custom HTML for the icon
        //       iconSize: [25, 25], // Size of the icon
        //       iconAnchor: [12, 12], // Point of the icon which will correspond to marker's location
        //       className: 'custom-div-icon' // Custom class for additional styling
        //     });
          
        //     L.marker([grid.gridCenter[1], grid.gridCenter[0]], {icon: icon})
        //       .addTo(map);
        //   });
        // }
        

            })



            // .then(dataLoaded => setDataLoad(true))
            .catch(error => console.error('Error fetching data:', error));
  
            // const onDateChange = (date) => {
            //   setSelectedDate(date);
            //   setSelectedTimelineDate(date);
            // };
            // const onTimelineDateChange = (date) => {
            //   setSelectedTimelineDate(date);
            //   console.log('Timeline DATE Changed')
            // };
          
            // const handlePlayPause = () => {
            //   setIsPlaying(!isPlaying);
            //   console.log('KSFLSD')
            //   if(!isPlaying){
            //     setSelectedDate(selectedTimelineDate)
            //   }
            // };
    
    let geoJsonLayer = null;

   // console.log(grids[0].gridCenter)
  
    
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
    // L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    //     attribution: '© OpenStreetMap contributors',
    //     zIndex: 2
    //   }).addTo(map);


      info = L.control();

      info.onAdd = function(){
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        this._div.style.marginTop= '`1.5rem';

        return this._div;
      }

      info.update = function (props){
        // if(currentMetric === 'avg_temp'){
        //     this._div.innerHTML = '<h4>Average Temperature </h4>' + (props ?
        //         '<b>' + props.name + '</b><br />' + props.avg_temp + ' &deg;C' :
        //         'Hover over a county');
        // }
        this._div.innerHTML = '<h4>Location </h4>' + (props ?
          '<b>' + props.name + '</b><br />' :
          'Hover over a county');
        
      }

      info.addTo(map);


      

//     metricsLayer = L.geoJSON(turf.featureCollection(grids), {
//       style: style,
//       onEachFeature: onEachFeature,
//   }).addTo(map);

//   geoJsonLayer = L.geoJSON(FloridaCountiesData, {
//     style: countyStyle,
//     onEachFeature: onEachFeature,
// }).addTo(map);

//   map.on('click', function(e) {
//     const clickedPoint = turf.point([e.latlng.lng, e.latlng.lat]);
//     metricsLayer.eachLayer(layer => {
//         if (turf.booleanPointInPolygon(clickedPoint, layer.feature)) {
//             showPopup(e, layer);
//         }
//     });
// });

// if(currentMetric == 'wind'){
//   grids.forEach(grid => {
//     const icon = L.divIcon({
//       html: '<div class="fas fa-arrow-right" style="transform: rotate(152deg);"></div>', // Your custom HTML for the icon
//       iconSize: [25, 25], // Size of the icon
//       iconAnchor: [12, 12], // Point of the icon which will correspond to marker's location
//       className: 'custom-div-icon' // Custom class for additional styling
//     });
  
//     L.marker([grid.gridCenter[1], grid.gridCenter[0]], {icon: icon})
//       .addTo(map);
//   });
// }





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
      <div class="map-icon" style="display: flex; text-align: center; align-items: center; margin-bottom: 20px; cursor: pointer;" onclick="window.switchMetric('clouds')">
      <i class="fas fa-cloud" style="font-size: 20px; color: #097d9f"></i>
        <span style="margin-left: 8px;  font-weight: bold">Cloud Cover</span>
      </div>
      <div class="map-icon" style="transform: rotate(0deg); display: flex; text-align: center; align-items: center; margin-bottom: 20px; cursor: pointer;" onclick="window.switchMetric('wind')">
      <i class="fas fa-wind" style="font-size: 20px; color: #899598"></i>
        <span style="margin-left: 8px;  font-weight: bold">Wind Speed and Direction</span>
      </div>
    `;

    //  // Create a div element to render the TemperatureRect component
    //  const temperatureRectComponent = document.createElement('div');
    
    //  // Render the TemperatureRect component inside the div
    //  ReactDOM.render(<TemperatureRect />, temperatureRectComponent);
    

     

    //  container.appendChild(temperatureRectComponent);
  
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

        // Render the TemperatureRect component inside the div
        // ReactDOM.render(<TemperatureRect />, temperatureRectComponent);
        // ReactDOM.render(<PrecipitationRect />, precipitationRectComponent);
        // ReactDOM.render(<WindRect />, windRectComponent);
        // ReactDOM.render(<WaveRect />, waveRectComponent);
        
        
        if(currentMetric === 'precipitation'){
          container.appendChild(precipitationRectComponent);
        }

        // else if(currentMetric === 'avg_temp'){
        //   container.appendChild(temperatureRectComponent);
        //  // api_url = 'http://localhost:4000/api/climate/avg?time=2022-12-01 00:00:00';

        // }

        // else if(currentMetric === 'min_temp'){
        //   container.appendChild(temperatureRectComponent);
        //  // api_url = 'http://localhost:4000/api/climate/min-low?time=2022-12-01 00:00:00';

        // }

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
          onDateChange={onDateChange} />)
        
        // // Render the TemperatureRect component inside the div
        // ReactDOM.render(<DatePickerComponent selectedDate={selectedDate} 
        //   onDateChange={onDateChange} />, DateSelectorComponent);
        
    
        container.appendChild(DateSelectorComponent);
        
        
      
        
  
          return container;
        }
      });

      const TimelineDayRulerControl = L.Control.extend({
      

        options: {
          position: 'bottomleft'
        },

        onAdd: function () {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom timeline-day-ruler');
          



        // Create a div element to render the TemperatureRect component
        const TimelineDayRulerComponent= document.createElement('div');
        
        
        // Render the TemperatureRect component inside the div
        ReactDOM.render(<TimelineDayRuler date={selectedDate} />, TimelineDayRulerComponent);
        
    
        container.appendChild(TimelineDayRulerComponent);
        
        
      
        
  
          return container;
        }
      });

      const TimelineYearRulerControl = L.Control.extend({
      

        options: {
          position: 'bottomleft'
        },

        onAdd: function () {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom timeline-day-ruler');
          



        // Create a div element to render the TemperatureRect component
        const TimelineYearRulerComponent= document.createElement('div');
        
        
        // Render the TemperatureRect component inside the div
        ReactDOM.render(<TimelineYearRuler date={selectedDate} onDateChange={onDateChange}/>, TimelineYearRulerComponent);
        
    
        container.appendChild(TimelineYearRulerComponent);
        
        
      
        
  
          return container;
        }
      });

      const TimelineRulerControl = L.Control.extend({
      

        options: {
          position: 'bottomleft'
        },

        onAdd: function () {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom timeline-day-ruler');
          



        // Create a div element to render the TemperatureRect component
        const TimelineRulerComponent= document.createElement('div');
        
        
        // Render the TemperatureRect component inside the div
        ReactDOM.render(<TimelineRuler date={selectedDate} timelineDate={selectedTimelineDate} onTimelineDateChange={onTimelineDateChange}/>, TimelineRulerComponent);
        
    
        container.appendChild(TimelineRulerComponent);
        
        
      
        
  
          return container;
        }
      });

      const AutoDateControl = L.Control.extend({
        options: {
            position: 'topleft' // You can adjust the position as needed
        },
    
        onAdd: function() {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            
            // Create a div element to render the AutoAdvanceDate component
            const autoDateComponent = document.createElement('div');
    
            // Render the AutoAdvanceDate component inside the div
            ReactDOM.render(<AutoDateComponent selectedDate={selectedDate} onDateChange={onDateChange} />, autoDateComponent );
    
            container.appendChild(autoDateComponent );
    
            return container;
        }
    });


      
      
     map.addControl(new customControl());
     map.addControl(new DateSelector());
    //map.addControl(new TimelineYearRulerControl());
    //  map.addControl(new AutoDateControl());
     map.addControl(new tempMeter());
    //  map.addControl(new DateSelector());

     
  
      // Expose function to window object so it can be accessed by inline onclick handlers
      window.switchMetric = (newMetric) => {
        setCurrentMetric(newMetric);
        // geoJsonLayer.eachLayer((layer) => {
        //   layer.setStyle(style(layer.feature));
        // });
      };

    

      

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [currentMetric, selectedDate]);



//   coordinatesToBeQueried.forEach(coordPair => {
//     console.log(coordPair.join(','));
// });





  return (
   
    // <div id="test" style={{ height: '100%', width: '100%', position: 'relative' }}>
    //   <div id="map" style={{ height: '85%', width: '100%', position: 'relative' }}> </div>
    //     <TimelineYearRuler  date={selectedDate} onDateChange={onDateChange} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }} />


    // </div>
      <div style={{ height: '100%', width: '100%', position: 'relative' }}>
              <div id="map" style={{ height: '85%', width: '100%', position: 'relative' }}> </div>
              {/* <TimelineRuler date={selectedDate} onDateChange={onDateChange} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }} /> */}
              <TimelineYearRuler  date={selectedDate} onDateChange={onDateChange} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }} />
              {/* <TimelineDayRuler  date={selectedDate} onDateChange={onDateChange} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }} /> */}




      </div>

    
   
  );
}

export default WeatherMap;
