import React, { useState, useEffect, useRef } from 'react';
import '../style/TimelineRuler.css'

const TimelineYearRuler = ({date, onDateChange}) => {
  const startDate = new Date(`1980-01-01T23:59:59`); 
  const endDate = new Date('2022-12-31T23:59:59');

  // Ensure the provided date is within the range
  const initialDate = new Date(date);
  if (initialDate < startDate) initialDate.setTime(startDate.getTime());
  if (initialDate > endDate) initialDate.setTime(endDate.getTime());

  // Calculate the difference in years for the slider max value
  const maxSliderValue = endDate.getFullYear() - startDate.getFullYear();

  // Calculate the initial slider value
  const initialSliderValue = initialDate.getFullYear() - startDate.getFullYear();

  const [currentDate, setCurrentDate] = useState(initialDate);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(initialSliderValue);

  useEffect(() => {
    if (new Date(date) >= startDate && new Date(date) <= endDate) {
        setCurrentDate(new Date(date));
        setSliderValue(new Date(date).getFullYear() - startDate.getFullYear());
    }
}, [date]);

  const handlePlayPause = () => {
      setIsPlaying(!isPlaying);
  };

  useEffect(() => {
      let interval;
      if (isPlaying) {
          interval = setInterval(() => {
              setCurrentDate((prevDate) => {
                  const nextDate = new Date(prevDate);
                  nextDate.setFullYear(prevDate.getFullYear() + 1);
                  if (nextDate > endDate) {
                      setIsPlaying(false); // Automatically pause when the end date is reached
                      clearInterval(interval); // Clear the interval here as well
                      return endDate;
                  }
                  onDateChange(nextDate); // Call onDateChange with the updated date
                  return nextDate;
              });
          }, 1000); // Update every second
      } else {
          clearInterval(interval); // Clear interval when isPlaying is false
      }

      return () => clearInterval(interval); // Clear interval on component unmount
  }, [isPlaying, endDate, onDateChange]);

  useEffect(() => {
      const diffInYears = currentDate.getFullYear() - startDate.getFullYear();
      setSliderValue(diffInYears);
  }, [currentDate, startDate]);

  const onSliderChange = (value) => {
    const newDate = new Date(startDate);
    newDate.setFullYear(startDate.getFullYear() + value);
    
    // Update the current date state and call the onDateChange callback
    setCurrentDate(newDate > endDate ? endDate : newDate);
    setSliderValue(value);
    onDateChange(newDate > endDate ? endDate : newDate); // This line informs the parent component about the date change
};
    return (
        <div className = "cont">
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
            <div className="currentDate">{date.toDateString()}</div>
        </div>
    );
};


// const TimelineRuler = () => {
//   const startDate = new Date('1999-04-31T23:59:59'); // Initialize to the current date
//   const endDate = new Date('2023-12-31T23:59:59'); // End of 2023
//   const oneDay = 86400000; // Milliseconds in one day

//   // Calculate the difference in days for the slider max value
//   const maxSliderValue = Math.floor((endDate - startDate) / oneDay);

//   const [currentDate, setCurrentDate] = useState(startDate);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [sliderValue, setSliderValue] = useState(0);

//   const handlePlayPause = () => {
//     setIsPlaying(!isPlaying);
//   };

//   useEffect(() => {
//     let interval;
//     if (isPlaying) {
//       interval = setInterval(() => {
//         setCurrentDate((prevDate) => {
//           const nextDate = new Date(prevDate.getTime() + oneDay);
//           return nextDate > endDate ? endDate : nextDate;
//         });
//       }, 1000); // Update every second
//     }
//     return () => clearInterval(interval);
//   }, [isPlaying, endDate]);

//   useEffect(() => {
//     const diffInDays = Math.floor((currentDate - startDate) / oneDay);
//     setSliderValue(diffInDays);
//   }, [currentDate, startDate]);

//   const onSliderChange = (value) => {
//     const newDate = new Date(startDate.getTime() + value * oneDay);
//     setCurrentDate(newDate > endDate ? endDate : newDate);
//     setSliderValue(value);
//   };

//   return (
//     <div>
//         <div className="timeline-container">
//         <button onClick={handlePlayPause} className="play-button">
//             {isPlaying ? 'Pause' : 'Play'}
//         </button>
//         <input
//             type="range"
//             min="0"
//             max={maxSliderValue}
//             value={sliderValue}
//             onChange={(e) => onSliderChange(Number(e.target.value))}
//             className="slider"
//         />
//         </div>
//         <div>Current Date: {currentDate.toDateString()}</div>
//     </div>
    
//   );
// };

export default TimelineYearRuler;
