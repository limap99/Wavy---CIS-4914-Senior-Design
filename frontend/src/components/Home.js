import React from 'react';
import '../style/Home.css';

function HomePage() {
    return (
        <div className="homepage">
            <div className="top-section">
                <div className="header-content">
                    <h1>About Wavy</h1>
                    <p>Wavy is a tool for everyday people to observe climate data for counties in Florida. In this full stack web application, users can easily
view historical meteorological and climatological data -- such as average temperature, minimum temperature, maximum temperature, average percipitation, wind speed/direction, and cloud cover -- over time through interactive maps.</p>
<a href="http://localhost:3000/weather-map" className="explore-button">Explore Weather Map</a>
                </div>
                <img src="/home1.PNG" alt="Relevant Description" className="header-image"/>
            </div>
        </div>
    );
}

export default HomePage;
