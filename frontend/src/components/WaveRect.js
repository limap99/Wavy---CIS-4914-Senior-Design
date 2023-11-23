import React from 'react';
import '../style/TemperatureRect.css';
const WaveRect = () => {
    return (
      <div className="colored-rectangle">
        <div className="color wv8">
          <span className="value">5ft</span>
        </div>
        <div className="color wv7">
          <span className="value">4ft</span>
        </div>
        <div className="color wv6">
          <span className="value">3ft</span>
        </div>
        <div className="color wv5">
          <span className="value">2ft</span>
        </div>
        <div className="color wv4">
          <span className="value">1ft</span>
        </div>
        <div className="color wv3">
          <span className="value">0ft</span>
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
  
  export default WaveRect;