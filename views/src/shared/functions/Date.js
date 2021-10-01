import React, { Component } from 'react';

class DateToday extends Component {
    constructor() {
        super();
        var today = new Date(),
        date = today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear() ;

        this.state = {
            currentDate: date
        }
    }

    render() {
        return <p className="headerDate">{ this.state.currentDate }</p>
    }
}

export default DateToday;