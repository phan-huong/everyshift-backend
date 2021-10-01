import React from 'react';
import { CALENDAR, get_week_by_day } from '../../shared/functions/FormatDate';

const CalendarTopBar = (props) => {
    const current_week = get_week_by_day(props.currentUserDate);
    // console.log(current_week);

    const display_month_and_year = () => {
        let start_month = current_week[0].getMonth();
        let end_month = current_week[current_week.length - 1].getMonth();
        let start_year = current_week[0].getFullYear();
        let end_year = current_week[current_week.length - 1].getFullYear()

        let output;
        if (start_month === end_month) {
            output = `${CALENDAR.months_short[start_month]} ${start_year}`;
        } else if (start_year === end_year) {
            output = `${CALENDAR.months_short[start_month]} / ${CALENDAR.months_short[end_month]} ${start_year}`;
        } else {
            output = `${CALENDAR.months_short[start_month]} ${start_year} / ${CALENDAR.months_short[end_month]} ${end_year}`;
        }

        return output;
    }

    return (
        <h5 className="month_label mb-0">{display_month_and_year()}</h5>
    )
}

export default CalendarTopBar
