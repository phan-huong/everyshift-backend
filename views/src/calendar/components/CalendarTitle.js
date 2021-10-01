import React from "react";
import { CALENDAR, get_week_by_day, correct_day_of_week } from "../../shared/functions/FormatDate";

const CalendarTitle = (props) => {
    const current_week = get_week_by_day(props.currentUserDate);

    return (
        <>
            <div className="hours_of_day_label"></div>
            <div className="days_of_week_label">
                { current_week.map((day, index) => {
                    return (
                        <div className="single_day_of_week_label" key={`day_title_${index}`}>
                            <span>{CALENDAR.days_super_short[correct_day_of_week(day.getDay())]}</span>
                            <span>{day.getDate()}</span>
                        </div>
                    )
                }) }
            </div>
        </> 
    )
}

export default CalendarTitle;