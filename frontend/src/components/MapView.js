import React, { useState } from 'react';
import TimelineYearRuler from './TimelineYearRuler';
import TemperatureRect from './TemperatureRect';
import PrecipitationRect from './PrecipitationRect';
import '../style/MapView.css';

const MapView = ({onMapViewChange}) => {
    // State to track which button is active
    const [activeButton, setActiveButton] = useState('date');

    // Function to toggle the active button
    const toggleButton = (button) => {
        onMapViewChange(button)
        setActiveButton(button);
        
        // if(button === 'date'){
        //     onMapViewChange('avg');
            
        //   }
        //   else{
        //     onMapViewChange('date');
        //   }
        
        // console.log(activeButton)
    };

    return (
        <div className="map-view-container">
            <button
                className={`date-button ${activeButton === 'date' ? 'active-view' : ''}`}
                onClick={() => toggleButton('date')}
            >
                Date
            </button>
            <button
                className={`average-button ${activeButton === 'average' ? 'active-view' : ''}`}
                onClick={() => toggleButton('average')}
            >
                40 Year Average
            </button>
            {/* {activeButton === 'date' ? <TemperatureRect /> : <PrecipitationRect />} */}
        </div>
    );
};

export default MapView;
