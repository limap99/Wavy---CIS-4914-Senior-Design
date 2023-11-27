// src/Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation from react-router-dom
import '../style/Navbar.css';

const Navbar = () => {
  const location = useLocation(); // Get the current location

  return (
    <div className="navbar">
      <div className="logo">
        <h1>Wavy</h1>
        {/* <img src="logo.png" alt="Website Logo" /> */}
      </div>
      <div className="nav-links">
        <Link to="/home" className={location.pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link
          to="/weather-map"
          className={
            location.pathname === '/weather-map' ? 'active' : ''
          }
        >
         Wavy Map
        </Link>
        <Link
          to="/search"
          className={
            location.pathname === '/search' ? 'active' : ''
          }
        >
         Search
        </Link>
      </div>
      <div className="time-range-selector">
      </div>
    </div>
  );
}

export default Navbar;
