// Constants
const CALENDAR = {
    days_of_week: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    days_short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    days_super_short: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    months_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    height_rate: 0.5
}

/**
 * Convert a date to format YYYY-MM-DD
 * @param {String} date_in 
 * @returns {String}
 */
function to_raw_date(date_in) {
    let date_out = '';
    if (date_in) {
        let new_date = new Date(date_in);
        let new_year = new_date.getFullYear();
        let new_month = new_date.getMonth() < 9 ? "0" + (new_date.getMonth() + 1) : new_date.getMonth() + 1;
        let new_day = new_date.getDate() < 10 ? "0" + new_date.getDate() : new_date.getDate();
        date_out = `${new_year}-${new_month}-${new_day}`;
    }
    return date_out;
}

// Convert a date to format DD-MM-YYYY
function to_standard_date(date_in) {
    let date_out = '';
    if (date_in) {
        let new_date = new Date(date_in);
        let new_year = new_date.getFullYear();
        let new_month = new_date.getMonth() < 9 ? "0" + (new_date.getMonth() + 1) : new_date.getMonth() + 1;
        let new_day = new_date.getDate() < 10 ? "0" + new_date.getDate() : new_date.getDate();
        date_out = `${new_day}-${new_month}-${new_year}`;
    }
    return date_out;
}

// Function to get Month
function get_this_month(date_in) {
    let date_out = '';
    if (date_in) {
        let new_date = new Date(date_in);
        let new_month = new_date.getMonth() + 1;
        date_out = `${new_month}`;
    }
    return date_out;
}

// Function to get Year
function get_this_year(date_in) {
    let date_out = '';
    if (date_in) {
        let new_date = new Date(date_in);
        let new_year = new_date.getFullYear();
        date_out = `${new_year}`;
    }
    return date_out;
}

function get_this_year_only() {
    let today = new Date();
    return today.getFullYear();
}

// Function to get Hour as number
function get_hour_as_number(time_in) {
    let hour_out;
    if (time_in) {
        let hour_arr = time_in.split(":");
        let hour_str = hour_arr[0];
        hour_out = parseInt(hour_str);
    }
    return hour_out;
}

// Function to get a week number (DEPRECATED)
function get_week_number(date) {
    let first_day = new Date(date.getFullYear(), 0, 1);
    let week_number = Math.ceil( (((date.getTime() - first_day.getTime()) / 86400000) + first_day.getDay() + 1) / 7 );
    return week_number.toString();
}

// Get ISO-8601 week number of year, weeks starting on Monday
// https://www.w3resource.com/javascript-exercises/javascript-date-exercise-24.php
function ISO8601_week_no(dt) {
    var tdt = new Date(dt.valueOf());
    var dayn = (dt.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    var firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) {
        tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

// Function to up date the full date (return tomorrow, yesterday or date of next/previous week)
function change_current_date(date_in, step) {
    // let date_in = new Date(date_str);
    let alt = date_in.getDate();
    let neu = alt + step;
    return new Date(date_in.getFullYear(), date_in.getMonth(), neu);
}

/**
 * Get a whole week by a certain date.
 * E.g. if selected date is 08.09.2021, then the it should return the whole week from 06.09.2021 to 12.09.2021
 * @param {Date} date_in
 * @returns {[Date]}
 */
function get_week_by_day(date_in) {
    let current_day = date_in.getDay();
    let current_date = date_in.getDate();
    let current_month = date_in.getMonth();
    let current_year = date_in.getFullYear();

    current_day = correct_day_of_week(current_day);

    let the_week = [];
    for (let day_index = 0; day_index < 7; day_index++) {
        let new_date;
        if (day_index < current_day) {
            let x = current_day - day_index;
            new_date = current_date - x;
        } else if (day_index > current_day) {
            let x = day_index - current_day;
            new_date = current_date + x;
        } else {
            new_date = current_date;
        }

        let full_date = new Date(current_year, current_month, new_date);
        the_week[day_index] = full_date;
        // let element_id = "day_text_" + day;
        // let element = document.getElementById(element_id);
        // element.innerText =
        //     (full_date.getDate() < 10 ? "0" + full_date.getDate() : full_date.getDate()) + "." +
        //     (full_date.getMonth() + 1 < 10 ? "0" + (full_date.getMonth() + 1) : full_date.getMonth() + 1) + "." +
        //     full_date.getFullYear();
    }

    // console.log(the_week);

    return the_week;
}

// Function to get correct day of week (0 as Monday,..., 6 as Sunday)
function correct_day_of_week(old_day) {
    let new_day = old_day === 0 ? 6 : old_day - 1;
    return new_day;
}

function get_time_of_day_label(minute_step, top, top_offset) {
    let output = [];
    // let top_position = top_offset ? top_offset : 0;
    let top_position = top_offset || 0;

    for (let hour = 0; hour < 24; hour++) {
        let new_time = make_pretty_time(hour);
        if (top) new_time = { label: new_time, top: top_position + "px" }
        output.push(new_time);
        if (hour > 0) top_position += minute_step;
    }

    return output;
}

function make_pretty_time(time_in) {
    return time_in < 10 ? "0" + time_in : time_in;
}

// Convert a date to format HH:MM
function to_raw_time(date) {
    let hours = make_pretty_time(date.getHours())
    let minutes = make_pretty_time(date.getMinutes());
    return `${hours}:${minutes}`;
}

function compare_date_standard(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate()
}

function to_total_minutes_raw(time_str) {
    let time_arr = time_str.split(":");
    let hours = parseInt(time_arr[0]);
    let minute = parseInt(time_arr[1]);
    return hours * 60 + minute;
}

function is_time_in_range(input_time, start_time, end_time) {
    let total_minutes_input = to_total_minutes_raw(input_time);
    let total_minutes_start = to_total_minutes_raw(start_time);
    let total_minutes_end = to_total_minutes_raw(end_time);

    return total_minutes_input >= total_minutes_start && total_minutes_input <= total_minutes_end;
}

function get_localstorage_current_date() {
    var localstorage_date_raw = localStorage.getItem("current_date");
    if (localstorage_date_raw) {
        return new Date(localstorage_date_raw)
    } else {
        let today = new Date();
        localStorage.setItem("current_date", today);
        return today;
    }
}

function set_localstorage_current_date(new_date) {
    localStorage.setItem("current_date", new_date);
}

export {
    CALENDAR,
    to_raw_date,
    to_raw_time,
    is_time_in_range,
    ISO8601_week_no,
    change_current_date,
    get_week_by_day,
    get_this_month,
    get_this_year,
    get_hour_as_number,
    correct_day_of_week,
    get_time_of_day_label,
    get_week_number,
    to_standard_date,
    compare_date_standard,
    get_localstorage_current_date,
    set_localstorage_current_date,
    get_this_year_only
}