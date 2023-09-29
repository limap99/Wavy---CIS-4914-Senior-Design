// src/Navbar.js
import React from 'react';
import '../style/Navbar.css'

function Navbar() {
  return (
    <div className="navbar">
      <div className="logo">
        <h1>Wavy</h1>
        {/* <img src="logo.png" alt="Website Logo" /> */}
      </div>
      <div className="time-range-selector">
        {/* Add your time range selector here */}
      </div>
    </div>
  );
}

export default Navbar;
