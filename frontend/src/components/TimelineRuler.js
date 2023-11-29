import React, { useState, useEffect } from 'react';
import TimelineYearRuler from './TimelineYearRuler';
import TimelineAverageRuler from './TimelineAverageRuler';

const TimelineRuler = ({date, onDateChange, mapView}) => {   
    return (
    <div >
        {mapView === 'date' && <TimelineYearRuler date={date} onDateChange={onDateChange} />}
        {mapView === 'average' && <TimelineAverageRuler date={date} onDateChange={onDateChange} />}
        

    </div>
    
    );
}

export default TimelineRuler
