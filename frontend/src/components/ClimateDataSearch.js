import React, { useState } from 'react';
import axios from 'axios';

const ClimateDataTable = () => {
    const [date, setDate] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [climateData, setClimateData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`http://localhost:4001/api/climate/data-by-coordinates-date`, {
                params: { date, lat: latitude, long: longitude }
            });
    
            console.log(response.data); // Log the API response to inspect its structure
    
            if (Array.isArray(response.data)) {
                setClimateData(response.data);
            } else {
                setError('Invalid data format received from API');
                setClimateData([]); // Reset climateData to an empty array in case of invalid format
            }
        } catch (err) {
            setError('Failed to fetch data: ' + err.message);
            setClimateData([]); // Also reset climateData in case of fetch error
        } finally {
            setLoading(false);
        }
    };
    
    
    
    

    const handleSubmit = (event) => {
        event.preventDefault();
        fetchData();
    };

    const parseClimateValue = (value) => {
        if (value && value.Valid) {
            return value.Float64.toFixed(2); // Round to two decimal places
        }
        return 'N/A';
    };

    // Style objects
    const containerStyle = {
        padding: '40px',
        maxWidth: '900px', // 20% wider than the original 720px
        margin: '0 auto',
        fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginBottom: '40px',
    };

    const inputGroupStyle = {
        display: 'flex',
        alignItems: 'center',
        margin: '5px 0',
        width: '100%',
    };

    const labelStyle = {
        marginRight: '10px',
        minWidth: '100px', // Ensure all labels are the same width
        textAlign: 'right',
        fontSize: '16px',
        fontWeight: 'bold'
    };

    const inputStyle = {
        padding: '12px 20px',
        borderRadius: '5px',
        border: '2px solid #007BFF',
        fontSize: '16px',
        flex: '1',
        marginLeft: '10px',
        width: 'calc(100% - 110px)', // Adjust width to align with inputs only
    };

    const buttonContainerStyle = {
        width: 'calc(100% - 110px)', // Set to align with input width
        display: 'flex',
        justifyContent: 'center', // Center the button within this container
    };

    const buttonStyle = {
        padding: '12px 25px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '20px',
    };
    
    const tableContainerStyle = {
        overflowX: 'auto',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        marginTop: '30px', // Increased margin for more space above the table
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
    };

    const tdStyle = {
        padding: '15px', // Increased padding for more space in data cells
        border: '1px solid #ddd',
        textAlign: 'center',
        fontSize: '16px',
    };

    const thStyle = {
        padding: '15px', // Increased padding for more space in data cells
        border: '1px solid #ddd',
        textAlign: 'center',
        fontSize: '16px',
    };

    const trStyle = index => ({
        backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
        '&:hover': {
            backgroundColor: '#e9ecef',
        },
    });

    const getThStyle = (columnIndex) => {
        const colors = ['#adb5bd'];
        return {
            padding: '15px',
            backgroundColor: colors[columnIndex % colors.length],
            color: 'white',
            border: '1px solid #ddd',
            textAlign: 'left',
            fontWeight: 'bold',
            minWidth: '150px',
        };
    };

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Date:</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Latitude:</label>
                    <input type="number" value={latitude} onChange={(e) => setLatitude(e.target.value)} style={inputStyle} />
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Longitude:</label>
                    <input type="number" value={longitude} onChange={(e) => setLongitude(e.target.value)} style={inputStyle} />
                </div>
                <button type="submit" style={buttonStyle}>Fetch Climate Data</button>
            </form>

            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}

            <h3>Climate Data:</h3>

            <div style={tableContainerStyle}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Latitude</th>
                        <th style={thStyle}>Longitude</th>
                        <th style={thStyle}>Significant Wave Height (inches)</th>
                        <th style={thStyle}>Dew Point Temperature Min (°F)</th>
                        <th style={thStyle}>Dew Point Temperature Mean (°F)</th>
                        <th style={thStyle}>Dew Point Temperature Max (°F)</th>
                        <th style={thStyle}>Temperature Min (°F)</th>
                        <th style={thStyle}>Temperature Mean (°F)</th>
                        <th style={thStyle}>Temperature Max (°F)</th>
                        <th style={thStyle}>Total Cloud Cover Min</th>
                        <th style={thStyle}>Total Cloud Cover Mean</th>
                        <th style={thStyle}>Total Cloud Cover Max</th>
                        <th style={thStyle}>Wind Speed Mean (mph)</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(climateData) && climateData.map((data, index) => (
                        <tr key={index} style={trStyle(index)}>
                            <td style={tdStyle}>{data.time}</td>
                            <td style={tdStyle}>{data.latitude}</td>
                            <td style={tdStyle}>{data.longitude}</td>
                            <td style={tdStyle}>{parseClimateValue(data.mwd_mean)}</td>
                            <td style={tdStyle}>{parseClimateValue(data.mwp_mean)}</td>
                            <td style={tdStyle}>{parseClimateValue(data.d2m_mean)}</td>
                            <td style={tdStyle}>{parseClimateValue(data.d2m_max)}</td>
                            <td style={tdStyle}>{parseClimateValue(data.t2m_min)}</td>
                            <td style={tdStyle}>{parseClimateValue(data.t2m_mean)}</td>
                            <td style={tdStyle}>{parseClimateValue(data.t2m_max)}</td>
                            <td style={tdStyle}>{parseClimateValue(data.tcc_min)}</td>
                            <td style={tdStyle}>{parseClimateValue(data.tcc_mean)}</td>
                            <td style={tdStyle}>{parseClimateValue(data.tcc_max)}</td>
                            <td style={tdStyle}>{parseClimateValue(data.wind_speed_mean)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default ClimateDataTable;
