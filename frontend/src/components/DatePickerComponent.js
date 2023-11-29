import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../style/DatePickerComponent.css';
import DatePickerAverage from './DatePickerAverage';
import DatePickerDate from './DatePickerDate';

const DatePickerComponent = ({ selectedDate, onDateChange, mapView }) => {


  return (
    <div>
      {mapView === 'date' && <DatePickerDate selectedDate={selectedDate} 
          onDateChange={onDateChange} mapView={mapView}/>}
      {mapView === 'average' && <DatePickerAverage selectedDate={selectedDate} 
          onDateChange={onDateChange} mapView={mapView}/>}
    </div>

    
  );
};

export default DatePickerComponent;
