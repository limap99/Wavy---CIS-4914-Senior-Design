import React from 'react';
import '../style/TemperatureRect.css';
const TemperatureRect = () => {
    return (
      <div className="colored-rectangle">
        <div className="color red">
          <span className="value">-5&deg;F</span>  
        </div>
        <div className="color green">
          <span className="value">10&deg;F</span>
        </div>
        <div className="color blue">
          <span className="value">25&deg;F</span>
        </div>
        <div className="color yellow">
          <span className="value">40&deg;F</span>
        </div>
        <div className="color orange">
          <span className="value">55&deg;F</span>
        </div>
        <div className="color purple">
          <span className="value">70&deg;F</span>
        </div>
        <div className="color pink">
          <span className="value">85&deg;F</span>
        </div>
        <div className="color brown">
          <span className="value">100&deg;F</span>
        </div>
      </div>
    );
  };
  
  export default TemperatureRect;