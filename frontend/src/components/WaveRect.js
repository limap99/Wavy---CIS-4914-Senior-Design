import React from 'react';
import '../style/TemperatureRect.css';
const WaveRect = () => {
    return (
      <div className="colored-rectangle">
        <div className="color wv3">
          <span className="value-cloud">90%</span>
        </div>
        <div className="color wv4">
          <span className="value-cloud">70%</span>
        </div>
        <div className="color wv5">
          <span className="value-cloud">50%</span>
        </div>
        <div className="color wv6">
          <span className="value-cloud">30%</span>
        </div>
        <div className="color wv7">
          <span className="value-cloud">20%</span>
        </div>
        <div className="color wv8">
          <span className="value-cloud">10%</span>
        </div>
        {/* <div className="color w2">
          <span className="value-cloud">10mph</span>
        </div>
        
        <div className="color w1">
          <span className="value-cloud">0mph</span>  
        </div> */}
      </div>
    );
  };
  
  export default WaveRect;