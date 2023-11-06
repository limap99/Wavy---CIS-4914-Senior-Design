import React from 'react';
import '../style/TemperatureRect.css';
const TemperatureRect = () => {
    return (
      <div className="colored-rectangle">
        <div className="color temp8">
          <span className="value">100&deg;F</span>
        </div>
        <div className="color temp7">
          <span className="value">85&deg;F</span>
        </div>
        <div className="color temp6">
          <span className="value">70&deg;F</span>
        </div>
        <div className="color temp5">
          <span className="value">55&deg;F</span>
        </div>
        <div className="color temp4">
          <span className="value">40&deg;F</span>
        </div>
        <div className="color temp3">
          <span className="value">25&deg;F</span>
        </div>
        <div className="color temp2">
          <span className="value">10&deg;F</span>
        </div>
        
        <div className="color temp1">
          <span className="value">-5&deg;F</span>  
        </div>
      </div>
    );
  };
  
  export default TemperatureRect;