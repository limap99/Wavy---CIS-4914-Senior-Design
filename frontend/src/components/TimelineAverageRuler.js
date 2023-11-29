import React, { useState, useEffect } from 'react';
import '../style/TimelineRuler.css';

const TimelineAverageRuler = ({ date, onDateChange }) => {
  const startDate = new Date('2020-01-01T00:00:00'); 
  const endDate = new Date('2020-12-31T23:59:59');
  const oneDay = 86400000; // Milliseconds in one day

  // Calculate the difference in days for the slider max value
  const maxSliderValue = Math.floor((endDate - startDate) / oneDay);

  const [currentDate, setCurrentDate] = useState(new Date(date));
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(Math.floor((new Date(date) - startDate) / oneDay));

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentDate((prevDate) => {
          const nextDate = new Date(prevDate.getTime() + oneDay);
          if (nextDate > endDate) {
            setIsPlaying(false);
            clearInterval(interval);
            return endDate;
          }
          onDateChange(nextDate); 
          return nextDate;
        });
      }, 1500); // Update every second
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isPlaying, endDate, onDateChange]);

  useEffect(() => {
    const diffInDays = Math.floor((currentDate - startDate) / oneDay);
    setSliderValue(diffInDays);
  }, [currentDate, startDate]);

  // Listen for changes in date prop
  useEffect(() => {
    if (!isPlaying) {
      const newDate = new Date(date);
      if (newDate >= startDate && newDate <= endDate) {
        if (currentDate.getTime() !== newDate.getTime()) {
          setCurrentDate(newDate);
          setSliderValue(Math.floor((newDate - startDate) / oneDay));
        }
      }
    }
  }, [date, startDate, endDate, isPlaying, currentDate]);

  const onSliderChange = (value) => {
    const newDate = new Date(startDate.getTime() + value * oneDay);
    setCurrentDate(newDate > endDate ? endDate : newDate);
    setSliderValue(value);
    onDateChange(newDate > endDate ? endDate : newDate);
  };

  return (
    <div className="cont">
      <div className="timeline-container">
        <button onClick={handlePlayPause} className="play-button">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min="0"
          max={maxSliderValue}
          value={sliderValue}
          onChange={(e) => onSliderChange(Number(e.target.value))}
          className="slider"
        />
      </div>
      <div className="currentDate">
        {currentDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
};

export default TimelineAverageRuler;
