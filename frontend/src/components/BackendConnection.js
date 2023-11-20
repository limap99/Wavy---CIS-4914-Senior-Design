import React, { useState, useEffect } from 'react';

const BackendConnection = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        // Fetch data from Go backend running on port 4000\
        fetch('http://localhost:4000/api/climate/avg?time=2022-12-01 00:00:00')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);  // The empty dependency array ensures this useEffect runs once when the component mounts
    console.log(data)
    return (
        <div>
            {data ? JSON.stringify(data) : 'Loading...'}
        </div>
    );
}

export default BackendConnection;
