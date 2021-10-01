import React from 'react';

import './Timesheet.css';
import Wishlist from '../wishlist/Wishlist';
import Paycheck from '../timesheet/Paycheck';

const Timesheet = () => {

    return (
        <div className="timesheet_wrapper">
            <nav className="nav nav-pills nav-fill">
                <a className="wishlist nav-item nav-link active" href="#wishlist" data-toggle="tab">Wishlist</a>
                <a className="finishedShifts nav-item nav-link" href="#paycheck" data-toggle="tab">Paycheck</a>
            </nav>
            <div className="tab-content" id="myTabContent">
                <div className="tab-pane fade show active" id="wishlist" role="tabpanel" aria-labelledby="home-tab"><Wishlist /></div>
                <div className="tab-pane fade" id="paycheck" role="tabpanel" aria-labelledby="profile-tab"><Paycheck /></div>
            </div>
        </div>
    )
}

export default Timesheet;