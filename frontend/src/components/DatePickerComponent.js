import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../style/DatePickerComponent.css';

const DatePickerComponent = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const minYear = 2023; // Define the minimum year
  const maxYear = 2023; // Define the maximum year
  

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const CustomInput = ({ value, onClick }) => (
    <input
      type="text"
      value={value}
      onClick={onClick}
      readOnly // Make the input field read-only
    />
  );

  return (
    <div>
      <h1 className='h1-datepicker'>Select a Date:</h1>
      <DatePicker
        selected={selectedDate}
        className="custom-datepicker"
        onChange={handleDateChange}
        dateFormat="MM/dd" // Adjust the date format as needed
        minDate={new Date(minYear, 0, 1)} // Set the minimum date to October 1st of the minimum year
        maxDate={new Date(maxYear, 11, 31)} // Set the maximum date to December 31st of the maximum year
        customInput={<CustomInput />} // Use custom input to make it read-only
        renderCustomHeader={({
          date,
          changeYear,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div style={{ margin: "10px", display: "flex", justifyContent: "center", }}>
            <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
              {"<"}
            </button>
            <span style={{ fontWeight: "bold", fontSize: "1.2rem", marginRight: "1rem", marginLeft: "1rem", color: "#213f9a" }}>{date.toLocaleDateString('default', { month: 'long' })}</span>
            <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
              {">"}
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default DatePickerComponent;
