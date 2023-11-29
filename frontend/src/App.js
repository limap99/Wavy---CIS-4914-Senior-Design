import React from 'react';
import './App.css';
import Home from './components/Home';
import WeatherMap from './components/WeatherMap';
import ClimateDataSearch from './components/ClimateDataSearch';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Route, Routes }  from 'react-router-dom';
import TemperatureRect from './components/TemperatureRect';
import PrecipitationRect from './components/PrecipitationRect'
import DatePickerComponent from './components/DatePickerComponent';
import BackendConnection from './components/BackendConnection';
import InteractiveMap from './components/InteractiveMap';

//const Home = () => <h2>Home Page</h2>;


const App = () => (
  <Router>
    <div className="App">
      <Navbar />
      <Routes>
        {/* <Route path="/" element={<BackendConnection/>} /> */}
        <Route path="/" element={<Home/>} />
        <Route path="/search" element={<ClimateDataSearch/>} />
        <Route path="/weather-map" element={<WeatherMap/>} />
      </Routes>
    </div>
  </Router>
);

// const App = () => {
//   return (
//     <div className="App">
//       {/* <h1>Wavy</h1> */}
//       <Navbar />
//       <WeatherMap />
     
//     </div>
//   );
// }

export default App;
