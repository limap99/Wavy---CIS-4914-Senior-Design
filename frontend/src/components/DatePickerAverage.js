import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../style/DatePickerComponent.css';

const DatePickerAverage = ({ selectedDate, onDateChange, mapView }) => {
  const fixedYear = 2020; // Fixed year for internal date handling

//   const handleDateChange = (date) => {
//     const newDate = new Date(fixedYear, date.getMonth(), date.getDate());
//     onDateChange(newDate);
//   };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const CustomHeader = ({
    date,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "10px" }}>
      {/* <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
        {"<"}
      </button> */}
      <select
        value={date.getMonth()}
        onChange={({ target: { value } }) => changeMonth(value)}
        style={{ margin: "0 10px" }}
      >
        {months.map((month, index) => (
          <option key={month} value={index}>
            {month}
          </option>
        ))}
      </select>
      {/* <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
        {">"}
      </button> */}
    </div>
  );

  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <input
      type="text"
      name="datePicker"
      value={value}
      onClick={onClick}
      readOnly
      ref={ref}
    />
  ));

  return (
    <div>
      <h1 className='h1-datepicker'>Select a Date:</h1>
      <DatePicker
        selected={selectedDate}
        onChange={onDateChange}
        className="custom-datepicker"
        dateFormat="MM-dd" // Format to show only month and day
        minDate={new Date(fixedYear, 0, 1)}
        maxDate={new Date(fixedYear, 11, 31)}
        
        renderCustomHeader={CustomHeader}
        customInput={<CustomInput />}
        showMonthDropdown
        scrollableMonthDropdown
      />
    </div>
  );
};

export default DatePickerAverage;
