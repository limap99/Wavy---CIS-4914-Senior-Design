import {floridaData} from './floridaData'
import * as turf from '@turf/turf';


const minLat = 24.396308;
const maxLat = 30.987679;
const minLon = -87.634643;
const maxLon = -80.031362;

//const stepSize = 0.10001;;  // Adjust step size to get desired resolution
const stepSize = 0.25001;

const roundToQuarter = number => Math.round(number * 4) / 4;;


const floridaPolygon = turf.multiPolygon(floridaData.geometry.coordinates);

let grids = [];
   
let coordinatesToBeQueried = [];

let roundedCoordinates = [];

let gridCenters = []

for(let lat = minLat; lat <= maxLat; lat += stepSize) {
    for(let lon = minLon; lon <= maxLon; lon += stepSize) {
        let centerPoint = turf.point([lon, lat]);
        if (turf.booleanPointInPolygon(centerPoint, floridaPolygon)) {
            let boundingBox = [
                lon - stepSize / 2 - 0.00001,
                lat - stepSize / 2 - 0.00001,
                lon + stepSize / 2 + 0.00001,
                lat + stepSize / 2 + 0.00001
            ];
            let grid= turf.bboxPolygon(boundingBox);
            grids.push(grid);

            let gridCenter = turf.center(grid);
            gridCenters.push(gridCenter)
        
        }
    }
}

for(let i = 0; i < gridCenters.length; i++){
    coordinatesToBeQueried.push(gridCenters[i].geometry.coordinates)
}

roundedCoordinates= coordinatesToBeQueried.map(coords => coords.map(roundToQuarter));

for(let i = 0; i < grids.length; i++){
    grids[i].gridCenter = roundedCoordinates[i];
  
}

export { grids, coordinatesToBeQueried, gridCenters, roundedCoordinates };