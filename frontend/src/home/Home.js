import React from 'react';
import ShiftToday from './ShiftToday';
import UpcomingShifts from './UpcomingShifts';

import './Home.css';

const Home = () => {
    return (
        <div className="home_wrapper">
            <ShiftToday />
            <UpcomingShifts />
        </div>
    )
}

export default Home;