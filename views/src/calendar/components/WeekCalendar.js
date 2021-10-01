import React, { useState, useEffect } from 'react';
import { get_ip, device_type } from '../../shared/components/localhost';
import { change_current_date, get_localstorage_current_date, set_localstorage_current_date } from '../../shared/functions/FormatDate';

import CalendarTopBar from './CalendarTopBar';
import WeekController from './WeekController';
import CalendarTitle from './CalendarTitle';
import CalendarMainWrapper from './CalendarMainWrapper';
import { CustomModal } from '../../shared/components/UIElements/CustomModal';
import './WeekCalendar.css';

const WeekCalendar = () => {
    const [userDate, setUserDate] = useState(get_localstorage_current_date());
    const [userShifts, setUserShifts] = useState([]);

    const update_week = (days_step) => {
        let new_date = change_current_date(userDate, days_step);
        set_localstorage_current_date(new_date);
        setUserDate(new_date);
    }

    const fetch_shifts = async (url, request_options) => {
        var status_code;
        await fetch(url, request_options)
        .then(response => {
            status_code = response.status;
            return response.json()
        })
        .then(result => {
            if (status_code === 200) {
                // console.log(result);
                setUserShifts(result.shifts);
            }
        })
        .catch(error => console.log('error', error));
    }

    useEffect(() => {
        let token = localStorage.getItem("logged_in_token");
        let userData = JSON.parse(localStorage.getItem("userData"));
        if (token && userData) {
            var myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);
            var requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            };
            
            if (userData.role === 'manager') {
                fetch_shifts(`https://${get_ip(device_type)}/shifts`, requestOptions)
            } else {
                fetch_shifts(`https://${get_ip(device_type)}/shifts/${userData._id}`, requestOptions)
            }
        }
    }, [userDate])

    return (
        <div className="calendar_page">
            <div className="calendar_wrapper">
                <CalendarTopBar currentUserDate={userDate} />
                <WeekController update={update_week} currentUserDate={userDate} />
                <div className="calender_inner_wrapper">   
                    <CalendarTitle currentUserDate={userDate} />
                    <CalendarMainWrapper currentUserDate={userDate} shifts={userShifts} />
                </div>
                <div className="create_shift_section">
                    <button className="btn formBtn" onClick={() => { window.location.href=`/shifts/create` }}>
                        <i className="fa fa-plus mr-2"></i><span>Create a new shift</span>
                    </button>
                </div>
            </div>
            <CustomModal 
                id="edit_shift_modal" 
                main_content_id="edit_shift_modal_content"
                title="Shift details"
                has_close_btn={true} 
                has_action_btn={false} 
            />
        </div>
    )
}

export default  WeekCalendar;