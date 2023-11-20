import React, { useState, useEffect, useRef } from 'react';

const AutoDateComponent = ({selectedDate, onDateChange}) => {
    const [isActive, setIsActive] = useState(false);
    const currentDateRef = useRef(selectedDate);

    const toggleAutoIncrement = () => {
        setIsActive(!isActive);
    };

    useEffect(() => {
        currentDateRef.current = selectedDate; // Update ref to the latest date
    }, [selectedDate]);

    useEffect(() => {
        let interval;

        if (isActive) {
            interval = setInterval(() => {
                const newDate = new Date(currentDateRef.current.getTime() + 86400000); // Increment by a day
                onDateChange(newDate);
                currentDateRef.current = newDate; // Update the ref after changing the date
            }, 1000);
        }

        return () => clearInterval(interval); // Clear interval on unmount or when isActive changes
    }, [isActive, onDateChange]);

    

    return (
        <div>
            <button onClick={toggleAutoIncrement}>
                {isActive ? 'Stop' : 'Start'}
            </button>
        </div>
    );
};

export default AutoDateComponent;
