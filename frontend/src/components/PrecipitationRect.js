import React from 'react';
import '../style/TemperatureRect.css';
const PrecipitationRect = () => {
    return (
      <div className="colored-rectangle">
        <div className="color prep7">
          <span className="value-prep">0 mm</span>  
        </div>
        <div className="color prep6">
          <span className="value-prep">1.5 mm</span>
        </div>
        <div className="color prep5">
          <span className="value-prep">2 mm</span>
        </div>
        <div className="color prep4">
          <span className="value-prep">3 mm</span>
        </div>
        <div className="color prep3">
          <span className="value-prep">7 mm</span>
        </div>
        <div className="color prep2">
          <span className="value-prep">10 mm</span>
        </div>
        <div className="color prep1">
          <span className="value-prep">20 mm</span>
        </div>
        
      </div>
    );
  };
  
  export default PrecipitationRect;