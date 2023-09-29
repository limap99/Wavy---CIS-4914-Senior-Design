import React from 'react';
import './App.css';
import WeatherMap from './components/WeatherMap';
import Navbar from './components/Navbar';


function App() {
  return (
    <div className="App">
      {/* <h1>Wavy</h1> */}
      <Navbar />
      <WeatherMap />
     
    </div>
  );
}

export default App;
