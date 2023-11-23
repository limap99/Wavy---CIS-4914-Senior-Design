import React, { useState, useEffect } from 'react';
import TimelineYearRuler from './TimelineYearRuler';
import TimelineDayRuler from './TimelineDayRuler';

const TimelineRuler = ({date, onDateChange}) => {
    const [viewType, setViewType] = useState('year');

    const handleViewTypeChange = (event) => {
        setViewType(event.target.value);
    };
    
    return (
    <div className='cont'>
        <h1 className='h1-timeline'>Timeline</h1>
        <div className="view-selector">
            <select value={viewType} onChange={handleViewTypeChange}>
                <option value="year">Yearly</option>
                <option value="daily">Daily</option>
            </select>
        </div>

        {viewType === 'year' ? <TimelineYearRuler date={date} onDateChange={onDateChange}/> : <TimelineDayRuler date={date} onDateChange={onDateChange}/>}
        

    </div>
    
    );
}

export default TimelineRuler
