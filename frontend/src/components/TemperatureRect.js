import React from 'react';
import '../style/TemperatureRect.css';
const TemperatureRect = () => {
    return (
      <div className="colored-rectangle">
        <div className="color temp8">
          <span className="value">90&deg;F</span>
        </div>
        <div className="color temp7">
          <span className="value">80&deg;F</span>
        </div>
        <div className="color temp6">
          <span className="value">70&deg;F</span>
        </div>
        <div className="color temp5">
          <span className="value">60&deg;F</span>
        </div>
        <div className="color temp4">
          <span className="value">50&deg;F</span>
        </div>
        <div className="color temp3">
          <span className="value">40&deg;F</span>
        </div>
        <div className="color temp2">
          <span className="value">30&deg;F</span>
        </div>
        
        <div className="color temp1">
          <span className="value">20&deg;F</span>  
        </div>
      </div>
    );
  };
  
  export default TemperatureRect;