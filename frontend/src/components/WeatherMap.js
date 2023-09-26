import React, { useState, useEffect } from 'react';
import L, { rectangle } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FloridaCountiesData } from '../data/FloridaCountiesData';
import {floridaData} from '../data/floridaData'
import * as turf from '@turf/turf';






 
 
const WeatherMap = () => { 
    // let map = null;
    const [currentMetric, setCurrentMetric] = useState('avg_temp');

    

    const minLat = 24.396308;
    const maxLat = 30.987679;
    const minLon = -87.634643;
    const maxLon = -80.031362;
    const stepSize = 0.1;  // Adjust step size to get desired resolution

    let floridaPolygons = [];

    // for(let i = 0; i < FloridaCountiesData.features.length; i++){
    //     if(FloridaCountiesData.features[i].geometry.type === 'Polygon'){
    //         floridaPolygons.push(turf.polygon(FloridaCountiesData.features[i].geometry.coordinates))
    //     }
    //     else if(FloridaCountiesData.features[i].geometry.type === 'MultiPolygon'){ 
    //         floridaPolygons.push(turf.multiPolygon(FloridaCountiesData.features[i].geometry.coordinates))
    //     }
    // }
    console.log(floridaPolygons)
    // const floridaPolygon = turf.polygon(floridaData.geometry.coordinates);
    const floridaPolygon = turf.multiPolygon(floridaData.geometry.coordinates);



    let rectangles = [];
   
    

    let centers = []

    // for(let i = 0; i < floridaPolygons.length; i++){
    //     for(let lat = minLat; lat <= maxLat; lat += stepSize) {
    //         for(let lon = minLon; lon <= maxLon; lon += stepSize) {
    //             let centerPoint = turf.point([lon, lat]);
    //             if (turf.booleanPointInPolygon(centerPoint, floridaPolygons[i])) {
    //                 let boundingBox = [
    //                     lon - stepSize / 2,
    //                     lat - stepSize / 2,
    //                     lon + stepSize / 2,
    //                     lat + stepSize / 2
    //                 ];
    //                 let rectangle = turf.bboxPolygon(boundingBox);
    //                 rectangles.push(rectangle);
    
    //                 let center = turf.center(rectangle);
    //                 centers.push(center)
                
    //             }
    //         }
    //     }
    // }
    
    for(let lat = minLat; lat <= maxLat; lat += stepSize) {
        for(let lon = minLon; lon <= maxLon; lon += stepSize) {
            let centerPoint = turf.point([lon, lat]);
            if (turf.booleanPointInPolygon(centerPoint, floridaPolygon)) {
                let boundingBox = [
                    lon - stepSize / 2,
                    lat - stepSize / 2,
                    lon + stepSize / 2,
                    lat + stepSize / 2
                ];
                let rectangle = turf.bboxPolygon(boundingBox);
                rectangles.push(rectangle);

                let center = turf.center(rectangle);
                centers.push(center)
            
            }
        }
    }

    console.log(rectangles.length);

    // for(let lat = minLat; lat <= maxLat; lat += stepSize) {
    //     for(let lon = minLon; lon <= maxLon; lon += stepSize) {
    //         let centerPoint = turf.point([lon, lat]);
    //         if (turf.booleanPointInPolygon(centerPoint, floridaPolygonMonroe)) {
    //             let boundingBox = [
    //                 lon - stepSize / 2,
    //                 lat - stepSize / 2,
    //                 lon + stepSize / 2,
    //                 lat + stepSize / 2
    //             ];
    //             let rectangle = turf.bboxPolygon(boundingBox);
    //             rectangles.push(rectangle);

    //             let center = turf.center(rectangle);
    //             centers.push(center)
            
    //         }
    //     }
    // }

   

    rectangles[0].properties.avg_temp = 31
    rectangles[1].properties.avg_temp = 21

    for(let i = 0; i < 100; i++){
        rectangles[i].properties.avg_temp = 1
    }

    for(let i = 100; i < 300; i++){
        rectangles[i].properties.avg_temp = 6
    }

    for(let i = 300; i < 500; i++){
        rectangles[i].properties.avg_temp = 11
    }

    for(let i = 500; i < 700; i++){
        rectangles[i].properties.avg_temp = 16
    }

    for(let i = 700; i < 900; i++){
        if(i <= 800)
            rectangles[i].properties.avg_temp = 21
        else
        rectangles[i].properties.avg_temp = 6
    }

    for(let i = 900; i < 1200; i++){
        rectangles[i].properties.avg_temp = 26
    }

    for(let i = 1200; i < rectangles.length; i++){
        rectangles[i].properties.avg_temp = 31
    }

    
    for(let i = 0; i < rectangles.length; i++){
        rectangles[i].properties.min_temp = 21
    }

    for(let i = 0; i < rectangles.length; i++){
        rectangles[i].properties.max_temp = 31
    }


    for(let i = 0; i < rectangles.length; i++){
        rectangles[i].properties.precipitation = 1.7
    }



    



    const grades = [-20, -10, 10, 15, 20, 25, 30];


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
        weight: 0,
        //weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
        };
    };

    const countyStyle = (feature) => {
        return {
        // fillColor: getColor(feature.properties[currentMetric]),
        fillColor: '',
        // weight: 0,
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.0
        };
    };

    

    // const style = (feature) => {
    //     return {
    //     fillColor: 'red',
    //     weight: 2,
    //     opacity: 1,
    //     color: 'red',
    //     dashArray: '3',
    //     fillOpacity: 0.7
    //     };
    // };


    const highlightFeature = (e) => {
        const layer = e.target;
    
        // layer.setStyle({
        // weight: 2,
        // color: '#666',
        // dashArray: '',
        // fillOpacity: 0.7
        // });

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
    let floridaLayer = null;
    let cityLayer = null;
    
    const mapContainer = document.getElementById('map');
    
    

    const bounds = [
        [14.392411, -140.185547], // Southwest coordinates
        [33.110291, -60.117188]  // Northeast coordinates
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

    //   floridaLayer = L.geoJSON(floridaData, {
    //     style: style
    //   }).addTo(map); // Add the Florida state boundary to the map


     //Add GeoJSON layer
    //   geoJsonLayer = L.geoJSON(FloridaCountiesData, {
    //     style: countyStyle,
    //     onEachFeature: onEachFeature,
    // }).bindPopup(function (layer) {
    //   return `${layer.feature.properties.avg_temp}°C`;
    //     //return `${layer.feature.properties.name}: ${layer.feature.properties.avg_temp}°C`;
    //   }).addTo(map);

    //    geoJsonLayer = L.geoJSON(FloridaCountiesData, {
    //     style: style,
    // }).bindPopup(function (layer) {
    //   return `${layer.feature.properties.avg_temp}°C`;
    //     //return `${layer.feature.properties.name}: ${layer.feature.properties.avg_temp}°C`;
    //   }).addTo(map);
    

      geoJsonLayer = L.geoJSON(turf.featureCollection(rectangles), {
        style: style,
    }).bindPopup(function (layer) {
      return `${layer.feature.properties.avg_temp}°C`;
        //return `${layer.feature.properties.name}: ${layer.feature.properties.avg_temp}°C`;
      }).addTo(map);

    //   geoJsonLayer = L.geoJSON(FloridaCountiesData, {
    //     style: countyStyle,
    //     onEachFeature: onEachFeature,
    // }).bindPopup(function (layer) {
    //   return `${layer.feature.properties[currentMetric]}°C`;
    //     //return `${layer.feature.properties.name}: ${layer.feature.properties.avg_temp}°C`;
    //   }).addTo(map);

    geoJsonLayer = L.geoJSON(FloridaCountiesData, {
        style: countyStyle,
        onEachFeature: onEachFeature,
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
        geoJsonLayer.eachLayer((layer) => {
          layer.setStyle(style(layer.feature));
        });
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
