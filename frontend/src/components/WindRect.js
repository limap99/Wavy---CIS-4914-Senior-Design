import React from 'react';
import '../style/TemperatureRect.css';
const WindRect = () => {
    return (
      <div className="colored-rectangle">
        <div className="color w8">
          <span className="value">40mph</span>
        </div>
        <div className="color w7">
          <span className="value">30mph</span>
        </div>
        <div className="color w6">
          <span className="value">20mph</span>
        </div>
        <div className="color w5">
          <span className="value">15mph</span>
        </div>
        <div className="color w4">
          <span className="value">10mph</span>
        </div>
        <div className="color w3">
          <span className="value">5mph</span>
        </div>
        {/* <div className="color w2">
          <span className="value">10mph</span>
        </div>
        
        <div className="color w1">
          <span className="value">0mph</span>  
        </div> */}
      </div>
    );
  };
  
  export default WindRect;