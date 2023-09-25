import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useLeafletContext, useMap } from 'react-leaflet';

// IDW logic extracted from your initial code
function simpleidw(canvas) {
    if (!(this instanceof simpleidw)) return new simpleidw(canvas);

    this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    this._ctx = canvas.getContext('2d');
    this._width = canvas.width;
    this._height = canvas.height;

    this._max = 1;
    this._data = [];
}

simpleidw.prototype = {

    defaultCellSize: 20,

    defaultGradient: {
        0: '#000066',
        0.1: 'blue',
        0.2: 'cyan',
        0.3: 'lime',
        0.4: 'yellow',            
        0.5: 'orange',
        0.6: 'red',
        0.7: 'Maroon',
        0.8: '#660066',
        0.9: '#990099',
        1: '#ff66ff'
    },

    data: function (data) {
        this._data = data;
        return this;
    },

    max: function (max) {
        this._max = max;
        return this;
    },

    add: function (point) {
        this._data.push(point);
        return this;
    },

    clear: function () {
        this._data = [];
        return this;
    },

    cellSize: function (r) {
        var cell = this._cell = document.createElement("canvas"),
        ctx = cell.getContext('2d');   

        this._r = r;

        return this;
    },

    resize: function () {
        this._width = this._canvas.width;
        this._height = this._canvas.height;
    },

    gradient: function (grad) {
        // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext('2d'),
            gradient = ctx.createLinearGradient(0, 0, 0, 256);

        canvas.width = 1;
        canvas.height = 256;

        for (var i in grad) {
            gradient.addColorStop(+i, grad[i]);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 256);

        this._grad = ctx.getImageData(0, 0, 1, 256).data;

        return this;
    },

    draw: function (opacity) {
        if (!this._cell) this.cellSize(this.defaultCellSize);
        if (!this._grad) this.gradient(this.defaultGradient);            

        var ctx = this._ctx;
        var grad =  this._grad;

        ctx.clearRect(0, 0, this._width, this._height);

        for (var i = 0, len = this._data.length, p; i < len; i++) {
            var p = this._data[i];
            var j = Math.round((p[2] / this._max)*255)*4;
            ctx.fillStyle = 'rgba('+grad[j]+','+grad[j+1]+','+grad[j+2]+','+opacity+')';
            ctx.fillRect(p[0] - this._r,p[1] - this._r,this._r,this._r);     
        }

        return this;
    }
};


L.IdwLayer = (L.Layer ? L.Layer : L.Class).extend({
    initialize: function(latlngs, options) {
        L.setOptions(this, options);
        this._latlngs = latlngs;
        this._idw = null;
    },
    onAdd: function(map) {
        this._map = map;
        this._canvas = L.DomUtil.create('canvas', 'leaflet-idw-layer leaflet-layer');
        const size = map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;
        map._panes.overlayPane.appendChild(this._canvas);

        this._idw = simpleidw(this._canvas);
        this._update();
        
        map.on('moveend', this._update, this);
        map.on('zoomend', this._resize, this);
    },
    onRemove: function(map) {
        L.DomUtil.remove(this._canvas);
        map.off('moveend', this._update, this);
        map.off('zoomend', this._resize, this);
    },
    _update: function() {
        if (!this._map) return;

        const bounds = this._map.getBounds(),
              topLeft = this._map.latLngToLayerPoint(bounds.getNorthWest()),
              bottomRight = this._map.latLngToLayerPoint(bounds.getSouthEast());

        L.DomUtil.setPosition(this._canvas, topLeft);

        const data = this._latlngs.map(latlng => {
            const point = this._map.latLngToLayerPoint(latlng);
            return [point.x, point.y, latlng.alt || 1];  // assuming altitude as the value
        });

        this._idw.data(data).max(this.options.max || 1).draw(this.options.opacity || 0.5);
    },
    _resize: function() {
        const size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;
        this._idw.resize();
        this._update();
    },
    setLatLngs: function(latlngs) {
        this._latlngs = latlngs;
        this._update();
    },
    setOptions: function(options) {
        L.setOptions(this, options);
        if (options.max) this._idw.max(options.max);
        if (this._map) this._update();
    }
});

L.idwLayer = function (latlngs, options) {
  return new L.IdwLayer(latlngs, options);
};


const IdwLayer = ({ latlngs, options }) => {
    const map = useMap();
    const idwRef = useRef(null);
  
    useEffect(() => {
      idwRef.current = L.idwLayer(latlngs, options).addTo(map);
  
      return () => {
        if (idwRef.current) {
          idwRef.current.remove();
        }
      };
    }, [map, latlngs, options]);
  
    useEffect(() => {
      if (idwRef.current) {
        idwRef.current.setLatLngs(latlngs);
      }
    }, [latlngs]);
  
    useEffect(() => {
      if (idwRef.current) {
        idwRef.current.setOptions(options);
      }
    }, [options]);
  
    return null;
  };

export default IdwLayer;
