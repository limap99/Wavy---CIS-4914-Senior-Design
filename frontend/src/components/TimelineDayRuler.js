import React, { useState, useEffect } from 'react';
import '../style/TimelineRuler.css';

const TimelineDayRuler = ({date, onDateChange}) => {
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
      setCurrentDate(newDate > endDate ? endDate : newDate);
      setSliderValue(value);
  };

  return (
      <div>
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
          <div className="currentDate">{currentDate.toDateString()}</div>
      </div>
  );
};
//   const startDate = new Date(`1999-01-01T23:59:59`); 
//   //const startDate = new Date(date);
//   const oneDay = 86400000; // Milliseconds in one day
//   //const endDate = new Date(startDate.getTime() + 30 * oneDay); // 30 days after the start date
//   const endDate = new Date(`2022-12-31T23:59:59`); // 30 days after the start date

//   // Calculate the difference in days for the slider max value
//   const maxSliderValue = Math.floor((endDate - startDate) / oneDay);

//   const [currentDate, setCurrentDate] = useState(startDate);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [sliderValue, setSliderValue] = useState(0);

//   const handlePlayingPause = () => {
//     //handlePlayPause();
//     console.log('PLAYYYY')
//     setIsPlaying(!isPlaying);
//   };

//   useEffect(() => {
//     let interval;
//     if (isPlaying) {
//       interval = setInterval(() => {
//         setCurrentDate((prevDate) => {
//           const nextDate = new Date(prevDate.getTime() + oneDay);
//          // onTimelineDateChange(nextDate)

//           return nextDate > endDate ? endDate : nextDate;
//         });
//         // const diffInDays = Math.floor((currentDate - startDate) / oneDay);
//         // setSliderValue(diffInDays);
//         // console.log('Slider: ' + sliderValue)
//       }, 2000); // Update every second
//     }
  
//     return () => clearInterval(interval);
//   }, [isPlaying, endDate, oneDay]);

//   useEffect(() => {
//     // const diffInDays = Math.floor((currentDate - startDate) / oneDay);
//     const diffInDays = Math.floor((currentDate - startDate) / oneDay);
//     setSliderValue(diffInDays);
//     console.log(`${diffInDays}`)
//   }, [currentDate, startDate, oneDay]);

//   const onSliderChange = (value) => {
//     const newDate = new Date(startDate.getTime() + value * oneDay);
//     setCurrentDate(newDate > endDate ? endDate : newDate);
//     setSliderValue(value);
//     console.log('Slider: ' + value)
//   };

//   return (
//     <div>
//       <div className="timeline-container">
//         <button onClick={handlePlayingPause} className="play-button">
//           {isPlaying ? 'Pause' : 'Play'}
//         </button>
//         <input
//           type="range"
//           min="0"
//           max={maxSliderValue}
//           value={sliderValue}
//           onChange={(e) => onSliderChange(Number(e.target.value))}
//           className="slider"
//         />
//       </div>
//       <div className="currentDate">{currentDate.toDateString()} </div>
//     </div>
//   );
// };

export default TimelineDayRuler;