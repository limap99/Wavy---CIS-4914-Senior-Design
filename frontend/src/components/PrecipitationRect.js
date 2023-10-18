import React from 'react';
import '../style/TemperatureRect.css';
const PrecipitationRect = () => {
    return (
      <div className="colored-rectangle">
        <div className="color prep1">
          <span className="value-prep">0.2 in</span>
        </div>
        <div className="color prep2">
          <span className="value-prep">0.1 in</span>
        </div>
        <div className="color prep3">
          <span className="value-prep">0.07 in</span>
        </div>
        <div className="color prep4">
          <span className="value-prep">0.03 in</span>
        </div>
        <div className="color prep5">
          <span className="value-prep">0.02 in</span>
        </div>
        <div className="color prep6">
          <span className="value-prep">0.015 in</span>
        </div>
        <div className="color prep7">
          <span className="value-prep">0 in</span>  
        </div>       
      </div>
    );
  };
  export default PrecipitationRect;