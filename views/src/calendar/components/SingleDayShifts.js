import React from "react";
import { correct_day_of_week, compare_date_standard } from "../../shared/functions/FormatDate";
import ShiftItem from './ShiftItem';

const SingleDayShifts = (props) => {
    const get_time_ranges = (all_shifts) => {
        let time_ranges = []
        for (const shift of all_shifts) {
            let new_time_range = `${shift.start_time}-${shift.end_time}`;
            if (!time_ranges.includes(new_time_range)) time_ranges.push(new_time_range);
        }
        return time_ranges;
    }

    const filter_shifts = () => {
        let filtered_shifts = [];
        for (const shift of props.shifts) {
            let shift_date = new Date(shift.date);
            for (const week_date of props.current_week) {
                let day_of_week = correct_day_of_week(week_date.getDay());

                if (compare_date_standard(shift_date, week_date) && day_of_week === props.current_day) {
                    filtered_shifts.push(shift);
                    break;
                }
            }
        }
        // console.log(filtered_shifts);

        let final_shifts = [];
        let time_ranges = get_time_ranges(filtered_shifts);
        for (const time_range of time_ranges) {
            let tempo_shifts = [];
            for (const filtered_shift of filtered_shifts) {
                let shift_time_range = `${filtered_shift.start_time}-${filtered_shift.end_time}`;
                if (time_range === shift_time_range) tempo_shifts.push(filtered_shift);
            }

            if (tempo_shifts.length === 1) {
                final_shifts.push(tempo_shifts[0]);
            } else if (tempo_shifts.length > 1) {
                final_shifts.push(tempo_shifts);
            }
        }
        // console.log(final_shifts);

        return final_shifts;
    }

    const shifts = filter_shifts();
    return (
        <>
            {
                shifts.length > 0 ? 
                shifts.map((shift, index) => {
                    return (
                        <ShiftItem key={`shift_item_${index}`} shift={shift} item_height={props.item_height} />
                    )
                })
                : <></>
            }
        </>
    )
}

export default SingleDayShifts;