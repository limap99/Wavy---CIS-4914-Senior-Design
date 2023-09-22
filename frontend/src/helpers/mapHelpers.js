import L from 'leaflet';

// You can import getColor or define it within this file
// import { getColor } from './someOtherFile';

export const getColor = (value, currentMetric) => {
  // Add your existing logic here to return color based on the value and currentMetric
  // ...
};

export const style = (feature, currentMetric) => {
  return {
    fillColor: getColor(feature.properties[currentMetric], currentMetric),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
};

export const highlightFeature = (e, info) => {
  const layer = e.target;

  layer.setStyle({
    weight: 2,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
};

export const resetHighlight = (e, info, currentMetric) => {
    const layer = e.target;
    layer.setStyle({
        fillColor: getColor(layer.feature.properties[currentMetric]),
        // weight: 2,
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    })
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update();
};
