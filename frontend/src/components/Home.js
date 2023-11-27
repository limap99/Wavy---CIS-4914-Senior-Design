import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Home.css';

function HomePage() {
    return (
        <div className="homepage">
            <div className="top-section">
                <div className="header-content">
                    <h1 className='header-h1'>About Wavy</h1>
                    <p className='header-info'>Wavy is a tool for everyday people to observe climate data for counties in Florida. In this full stack web application, users can easily
view historical meteorological and climatological data -- such as average temperature, minimum temperature, maximum temperature, average percipitation, wind speed/direction, and cloud cover -- over time through interactive maps.</p>
<Link to="/weather-map" className="explore-button">Explore Weather Maps</Link>
{/* <a href="http://localhost:3001/weather-map" className="explore-button">Explore Weather Map</a> */}
                </div>
                <img src="/home1.PNG" alt="" className="header-image"/>
            </div>
        </div>
    );
}

export default HomePage;
