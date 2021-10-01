import React, { useState, useEffect } from 'react';

import { get_local_user_data, get_local_user_token } from '../shared/functions/General';
import { to_raw_date } from '../shared/functions/FormatDate';
import { get_ip, device_type } from '../shared/components/localhost';

import './ShiftToday.css';

const ShiftToday = () => {
    const [shiftData, setShiftData] = useState([]);

    useEffect(() => {
        const fetch_shift_today = async () => {
            const localUser = get_local_user_data();
            const user_id = localUser._id;

            let token = get_local_user_token();
            if (token) {
                var myHeaders = new Headers();
                myHeaders.append("Authorization", `Bearer ${token}`);
                var requestOptions = {
                    method: 'GET',
                    headers: myHeaders,
                    redirect: 'follow'
                };
        
                var status_code;
                await fetch(`https://${get_ip(device_type)}/shifts/${user_id}`, requestOptions)
                .then(response => {
                    status_code = response.status;
                    return response.json()
                })
                .then(result => {
                    if (status_code === 200) {
                        setShiftData(result.shifts);
                    }
                })
                .catch(error => console.log('error', error));
            }
        }
        fetch_shift_today();

    }, [])

    const compare_dates = () => {
        let today_raw = new Date();
        let today = to_raw_date(today_raw);
        let shifts_today = [];
        let today_job, today_start, today_end, shift_status;
        for (const shift_today of shiftData) {
            let shift_date_raw = shift_today.date;
            let shift_date = to_raw_date(shift_date_raw);
            if (today === shift_date) {
                shifts_today.push(shift_today);
                today_job = shift_today.job;
                today_start = shift_today.start_time;
                today_end = shift_today.end_time;
                shift_status = shift_today.status;
            }
        } 
        
        if (shifts_today.length === 0 || 
            (shifts_today.length === 1 && shift_status === 'pending') || 
            (shifts_today.length === 1 && shift_status === 'denied') 
            ) {
            return <div className="work_day">
                <div>
                    <p>You are free today!</p>
                    <p>Just sit back and relax!</p>
                </div>
                <img src={`${process.env.PUBLIC_URL}/icons/no-work-day.gif`} alt="free day"/>
            </div>
        } if (shifts_today.length === 1 && shift_status === 'accepted') {
            return <div className="work_day">
                <div>
                    <p>It's work day today!</p>
                    <p>Your job: {today_job} <br />
                    Time: from {today_start} to {today_end}</p>
                </div>
                <img src={`${process.env.PUBLIC_URL}/icons/work-alarm.gif`} alt="work alarm"/>
            </div>
        } if (shifts_today.length === 1 && shift_status === 'done') {
            return <div className="work_day">
            <div>
                <p>You have done your job today!</p>
                <p>Just sit back and relax!</p>
            </div>
            <img src={`${process.env.PUBLIC_URL}/icons/shift-done.gif`} alt="shift done"/>
        </div>
        } if (shifts_today.length === 2) {
            let shift_1 = shifts_today[0];
            let shift_2 = shifts_today[1];
            if (shift_1.status === 'accepted' || shift_2.status === 'accepted') {
                return <div className="work_day">
                <div>
                    <p>It's work day today!</p>
                    <p>Your job: {shift_1.job}<br />
                    Time: from {shift_1.start_time} to {shift_1.end_time}</p>
                    <p>Your job: {shift_2.job}<br />
                    Time: from {shift_2.start_time} to {shift_2.end_time}</p>
                </div>
                <img src={`${process.env.PUBLIC_URL}/icons/work-alarm.gif`} alt="work alarm"/>
            </div>
            }
            if (shift_1.status === 'done' || shift_2.status === 'done') {
                return <div className="work_day">
                <div>
                    <p>You have done your job today!</p>
                    <p>Just sit back and relax!</p>
                </div>
                <img src={`${process.env.PUBLIC_URL}/icons/shift-done.gif`} alt="shift done"/>
            </div>
            }
        } else return <div className="work_day">
            <div>
                <p>You are free today!</p>
                <p>Just sit back and relax!</p>
            </div>
            <img src={`${process.env.PUBLIC_URL}/icons/no-work-day.gif`} alt="free day"/>
        </div>
    }

    return <div className="shift_today_wrapper">        
        {compare_dates()}
    </div>
}

export default ShiftToday;