import React from 'react';
import './App.css';
import WeatherMap from './components/WeatherMap';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Route, Routes }  from 'react-router-dom';

const Home = () => <h2>Home Page</h2>;

const App = () => (
  <Router>
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/weather-map" element={<WeatherMap />} />
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
