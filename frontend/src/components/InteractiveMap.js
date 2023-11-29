import React, { useState, useEffect } from 'react';
import TimelineYearRuler from './TimelineYearRuler';
import TimelineDayRuler from './TimelineDayRuler';
import WeatherMap from './WeatherMap';
import { format } from 'date-fns';

const InteractiveMap = () => {
    const [data, setData] = useState(null);
    const [viewType, setViewType] = useState('year');
    const [date, setDate] = useState(new Date('1999-04-30T23:59:59'));

    const onDateChange = (date) => {
        setDate(date);
        //setSelectedTimelineDate(date);
      };
    
    useEffect(() => {
        let  formattedDate = format(date, 'yyyy-MM-dd')
        // Fetch data from Go backend running on port 4000\
        fetch(`http://localhost:4000/api/climate/waveheight?time=${formattedDate} 00:00:00`)
            .then(response => response.json())
            .then(data => {
                setData(data)
                // console.log(data[0].mean_sea_wave_height)
            })
            .catch(error => console.error('Error fetching data:', error));
    }, [date]);  // The empty dependency array ensures this useEffect runs once when the component mounts

    const handleViewTypeChange = (event) => {
        setViewType(event.target.value);
    };

    
    
    return (
        <div>
        {/* <div className="view-selector">
            <select value={viewType} onChange={handleViewTypeChange}>
                <option value="year">Yearly</option>
                <option value="daily">Daily</option>
            </select>
        </div>

        {viewType === 'year' ? <TimelineRuler /> : <TimelineDayRuler />}
         */}
        
        <div>
            {data ? JSON.stringify(data) : 'Loading...'}
        </div>
         <TimelineYearRuler date={date} onDateChange={onDateChange}/>

    </div>
    );
}

export default InteractiveMap;
