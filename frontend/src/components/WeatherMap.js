import React, { useState, useEffect } from 'react';
import L, { rectangle } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FloridaCountiesData } from '../data/FloridaCountiesData';
import * as turf from '@turf/turf';
import { grids, coordinatesToBeQueried } from '../data/gridData';
import TemperatureRect from './TemperatureRect';
import ReactDOM from 'react-dom';
import PrecipitationRect from './PrecipitationRect';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

import DatePickerComponent from './DatePickerComponent';





 
 
const WeatherMap = () => { 
    
    const [currentMetric, setCurrentMetric] = useState('avg_temp');

    const [data, setData] = useState(null);
    const [dataLoaded, setDataLoad] = useState(false);

 
    // console.log(coordinatesToBeQueried)

    // coordinatesToBeQueried.forEach(coordinates => {
    //   console.log(coordinates);
    // });
  let map = null
  


   
  


    const getColor = (value) => {
        // Modify getColor to be generic for both temp and precip
        if (currentMetric === 'avg_temp') {
          // ... your existing temperature colors logic
          return value > 100 ? '#800026' : // Very hot
            value > 85 ? '#BD0026' : // Hot
            value > 70 ? '#E31A1C' : // Warm
            value> 55 ? '#FC4E2A' :
            value > 40 ? '#FD8D3C' :
            value > 25  ? '#FEB24C' :
            value> 10 ? '#FED976' :
                        '#d8a6268c';
        } 
        else if (currentMetric === 'min_temp') {
            // ... your existing temperature colors logic
            return value > 100 ? '#800026' : // Very hot
              value > 85 ? '#BD0026' : // Hot
              value > 70 ? '#E31A1C' : // Warm
              value> 55 ? '#FC4E2A' :
              value > 40 ? '#FD8D3C' :
              value > 25  ? '#FEB24C' :
              value> 10 ? '#FED976' :
                          '#d8a6268c';
        }
        if (currentMetric === 'max_temp') {
            // ... your existing temperature colors logic
            return value > 100 ? '#800026' : // Very hot
              value > 85 ? '#BD0026' : // Hot
              value > 70 ? '#E31A1C' : // Warm
              value> 55 ? '#FC4E2A' :
              value > 40 ? '#FD8D3C' :
              value > 25  ? '#FEB24C' :
              value> 10 ? '#FED976' :
                          '#d8a6268c';
          }
        else if (currentMetric === 'precipitation') {
          // ... add logic for precipitation colors
          return value > 0.2 ? '#0033CC' : // Very Wet
          value > 0.1 ? '#3366FF' : // Wet
          value > 0.07? '#6699FF' : // Moderate
          value > 0.03  ? '#99CCFF' :
          value > 0.02  ? '#CCE5FF' :
          value > 0.015  ? '#E5F2FF' :
                     '#F0F8FF'; // Dry
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

    const propagateClick = (e) => {
      // Check if the event has a custom property indicating it's been propagated
      if (e._propagated) return;
    
      const layerElement = e.target._path;
      if (layerElement) {
          layerElement.style.pointerEvents = 'none';
          const newClick = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
          });
    
          // Add a custom property to the new event
          newClick._propagated = true;
    
          e.originalEvent.target.dispatchEvent(newClick);
          setTimeout(() => {
              layerElement.style.pointerEvents = '';
          }, 10);
      }
    };
    
    
    const showPopup = (e, layer) => {
      const metric = layer.feature.properties[currentMetric];
      if (currentMetric === "precipitation") {
          layer.bindPopup(`${metric} in`).openPopup();
      } else {
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


  useEffect(() => {

    fetch('http://localhost:4000/api/climate/')
            .then(response => response.json())
            .then(data => setData(data[1]))
            .then(dataLoaded => setDataLoad(true))
            .catch(error => console.error('Error fetching data:', error));
    

    for(let i = 0; i < 100; i++){
      grids[i].properties.avg_temp = -5
  }

  for(let i = 100; i < 300; i++){
      grids[i].properties.avg_temp = 10
  }

  for(let i = 300; i < 500; i++){
      grids[i].properties.avg_temp = 25
  }

  for(let i = 500; i < 700; i++){
      grids[i].properties.avg_temp = 40
  }

  for(let i = 700; i < 900; i++){
      if(i <= 800)
          grids[i].properties.avg_temp = 55
      else
      grids[i].properties.avg_temp =110
  }

  for(let i = 900; i < 1200; i++){
      grids[i].properties.avg_temp = 70
  }

  for(let i = 1200; i < grids.length; i++){
      grids[i].properties.avg_temp = 95
  }

//   for(let i = 0; i < grids.length; i++){
//     grids[i].properties.min_temp = data.Climate_Daily_Low_F;
// }

  
  for(let i = 0; i < grids.length; i++){
    if(dataLoaded){
      grids[i].properties.min_temp = data.Climate_Daily_Low_F;
      grids[i].properties.max_temp = data.Climate_Daily_High_F;
      grids[i].properties.precipitation = data.Climate_Daily_Precip_In;
    }
     
     
  }
 

    // // Initialize the map
    //let map = null;

    
    
    
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

      let metricsLayer = null;



    //   geoJsonLayer = L.geoJSON(turf.featureCollection(grids), {
    //     style: style,
    // }).bindPopup(function (layer) {
    //   return `${layer.feature.properties.avg_temp}°F`;
    //   }).addTo(map);

    //   geoJsonLayer = L.geoJSON(FloridaCountiesData, {
    //     style: countyStyle,
    //     onEachFeature: onEachFeature,
    // }).bindPopup(function (layer) {
    //   return `${layer.feature.properties[currentMetric]}°F`;
    //   }).addTo(map);

    //   metricsLayer = L.geoJSON(turf.featureCollection(grids), {
    //     style: gridStyle,
    //     onEachFeature: onEachFeatureGrid,
    // }).bindPopup(function (layer) {
    //   if(currentMetric === "precipitation"){
    //     return `${layer.feature.properties[currentMetric]} in`;
    //   }
    //   else{
    //     return `${layer.feature.properties[currentMetric]}°F`;
    //   }
    //   }).addTo(map);

      

    metricsLayer = L.geoJSON(turf.featureCollection(grids), {
      style: style,
  }).addTo(map);

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




  //   geoJsonLayer.eachLayer(function (layer) {
  //     layer.getElement().style.pointerEvents = 'none';
  // });

   


      
    




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
        
        // Render the TemperatureRect component inside the div
        ReactDOM.render(<TemperatureRect />, temperatureRectComponent);
        ReactDOM.render(<PrecipitationRect />, precipitationRectComponent);
        
        
        if(currentMetric === 'precipitation'){
          container.appendChild(precipitationRectComponent);
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
        
        
        // Render the TemperatureRect component inside the div
        ReactDOM.render(<DatePickerComponent />, DateSelectorComponent);
        
    
        container.appendChild(DateSelectorComponent);
        
        
      
        
  
          return container;
        }
      });


      
      
     map.addControl(new customControl());
     map.addControl(new DateSelector());
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
  }, [currentMetric]);

  console.log(data)
  console.log(coordinatesToBeQueried)
  

  return (
    <div id="map" style={{ height: '100%', width: '100%' }}>
    
    </div>
  );
}

export default WeatherMap;
