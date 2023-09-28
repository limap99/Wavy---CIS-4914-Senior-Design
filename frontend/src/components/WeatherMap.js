import React, { useState, useEffect } from 'react';
import L, { rectangle } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FloridaCountiesData } from '../data/FloridaCountiesData';
import {floridaData} from '../data/floridaData'
import * as turf from '@turf/turf';
import { grids, coordinatesToBeQueried } from '../data/gridData';






 
 
const WeatherMap = () => { 
    // let map = null;
    const [currentMetric, setCurrentMetric] = useState('avg_temp');

 
    console.log(coordinatesToBeQueried)

    // coordinatesToBeQueried.forEach(coordinates => {
    //   console.log(coordinates);
    // });

  


   
    // dummy data coloring

    for(let i = 0; i < 100; i++){
        grids[i].properties.avg_temp = 1
    }

    for(let i = 100; i < 300; i++){
        grids[i].properties.avg_temp = 6
    }

    for(let i = 300; i < 500; i++){
        grids[i].properties.avg_temp = 11
    }

    for(let i = 500; i < 700; i++){
        grids[i].properties.avg_temp = 16
    }

    for(let i = 700; i < 900; i++){
        if(i <= 800)
            grids[i].properties.avg_temp = 21
        else
        grids[i].properties.avg_temp = 6
    }

    for(let i = 900; i < 1200; i++){
        grids[i].properties.avg_temp = 26
    }

    for(let i = 1200; i < grids.length; i++){
        grids[i].properties.avg_temp = 31
    }

    
    for(let i = 0; i < grids.length; i++){
        grids[i].properties.min_temp = 21
    }

    for(let i = 0; i < grids.length; i++){
        grids[i].properties.max_temp = 6
    }


    for(let i = 0; i < grids.length; i++){
        grids[i].properties.precipitation = 1.7
    }



  


    const getColor = (value) => {
        // Modify getColor to be generic for both temp and precip
        if (currentMetric === 'avg_temp') {
          // ... your existing temperature colors logic
          return value > 30 ? '#800026' : // Very hot
            value > 25 ? '#BD0026' : // Hot
            value > 20 ? '#E31A1C' : // Warm
            value> 15 ? '#FC4E2A' :
            value > 10 ? '#FD8D3C' :
            value > 5  ? '#FEB24C' :
            value> 0 ? '#FED976' :
                        '#9489d2';
        } 
        else if (currentMetric === 'min_temp') {
            // ... your existing temperature colors logic
            return value > 30 ? '#800026' : // Very hot
              value > 25 ? '#BD0026' : // Hot
              value > 20 ? '#E31A1C' : // Warm
              value> 15 ? '#FC4E2A' :
              value > 10 ? '#FD8D3C' :
              value > 5  ? '#FEB24C' :
              value> 0 ? '#FED976' :
                          '#9489d2';
        }
        if (currentMetric === 'max_temp') {
            // ... your existing temperature colors logic
            return value > 30 ? '#800026' : // Very hot
              value > 25 ? '#BD0026' : // Hot
              value > 20 ? '#E31A1C' : // Warm
              value> 15 ? '#FC4E2A' :
              value > 10 ? '#FD8D3C' :
              value > 5  ? '#FEB24C' :
              value> 0 ? '#FED976' :
                          '#9489d2';
          }
        else if (currentMetric === 'precipitation') {
          // ... add logic for precipitation colors
          return value > 2.0 ? '#0033CC' : // Very Wet
          value > 1.5 ? '#3366FF' : // Wet
          value > 1.0? '#6699FF' : // Moderate
          value > 0.5  ? '#99CCFF' :
          value > 0.2  ? '#CCE5FF' :
          value > 0.1  ? '#E5F2FF' :
                     '#F0F8FF'; // Dry
        }
      };

    const style = (feature) => {
        return {
        fillColor: getColor(feature.properties[currentMetric]),
        //fillColor: 'red',
        //weight: 0,
        weight: 2,
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
        weight: 0,
        //weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
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
        
    };

    

   

        const onEachFeature = (feature, layer) => {
        layer.on({
            mouseover: (e) => highlightFeature(e, info),
            mouseout: (e) => resetHighlight(e, info, currentMetric),
            
        });
    };

    let info;


  useEffect(() => {


   

    // Initialize the map
    let map = null;

    
    
    
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
      }).setView([28, -82], 7);

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
        this._div.style.marginTop= '0rem';

        return this._div;
      }

      info.update = function (props){
        // if(currentMetric === 'avg_temp'){
        //     this._div.innerHTML = '<h4>Average Temperature </h4>' + (props ?
        //         '<b>' + props.name + '</b><br />' + props.avg_temp + ' &deg;C' :
        //         'Hover over a county');
        // }
        if(currentMetric === 'avg_temp'){
            this._div.innerHTML = '<h4>Location </h4>' + (props ?
                '<b>' + props.name + '</b><br />' :
                'Hover over a county');
        }
        else if(currentMetric === 'min_temp'){
            this._div.innerHTML = '<h4>Minimum Temperature </h4>' + (props ?
                '<b>' + props.name + '</b><br />' + props.avg_temp + ' &deg;C' :
                'Hover over a county');
        }
        else if(currentMetric === 'max_temp'){
            this._div.innerHTML = '<h4>Maximum Temperature </h4>' + (props ?
                '<b>' + props.name + '</b><br />' + props.avg_temp + ' &deg;C' :
                'Hover over a county');
        }
        else if(currentMetric === 'precipitation'){
            this._div.innerHTML = '<h4>Average Precipitation </h4>' + (props ?
                '<b>' + props.name + '</b><br />' + props.precipitation + ' mm' :
                'Hover over a county');
        }
       
      }

      info.addTo(map);



      geoJsonLayer = L.geoJSON(turf.featureCollection(grids), {
        style: style,
    }).bindPopup(function (layer) {
      return `${layer.feature.properties.avg_temp}°C`;
      }).addTo(map);

      geoJsonLayer = L.geoJSON(FloridaCountiesData, {
        style: countyStyle,
        onEachFeature: onEachFeature,
    }).bindPopup(function (layer) {
      return `${layer.feature.properties[currentMetric]}°C`;
      }).addTo(map);

    




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
        <span style="margin-left: 8px;  font-weight: bold">Average Temperature</span>
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
  
          return container;
        }
      });
  
     map.addControl(new customControl());
  
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

  

  return (
    <div id="map" style={{ height: '100%', width: '100%' }}>
    </div>
  );
}

export default WeatherMap;
