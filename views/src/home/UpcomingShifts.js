import React, { useState, useEffect } from 'react';

import { get_local_user_data, get_local_user_token, sort_by_date } from '../shared/functions/General';
import { to_standard_date, compare_date_standard } from '../shared/functions/FormatDate';
import { get_ip, device_type } from '../shared/components/localhost';

import './UpcomingShifts.css';

const UpcomingShifts = (props) => {
    const [shiftData, setShiftData] = useState([]);

    const get_upcomming_shifts = (shift_data, max_shifts) => {
        let final_shifts = [];
        let sorted_shift_data = sort_by_date(shift_data);
        let today_obj = { today: true, date: new Date() };

        for (let index = 0; index < sorted_shift_data.length; index++) {
            let tempo_arr = [];
            tempo_arr.push(today_obj, sorted_shift_data[index]);
            let sorted_tempo = sort_by_date(tempo_arr);

            if (sorted_tempo[0].hasOwnProperty("today") && 
                !compare_date_standard(new Date(sorted_tempo[0].date), new Date(sorted_tempo[1].date))) {
                let difference = sorted_shift_data.length - index;
                let max_loop = difference >= 0 && difference <= max_shifts ? sorted_shift_data.length : index + max_shifts;

                for (let final_index = index; final_index < max_loop; final_index++) {
                    let final_shift = sorted_shift_data[final_index];
                    if (final_shift.status === 'accepted') final_shifts.push(sorted_shift_data[final_index]);
                }
                break;
            }
        }
        
        return final_shifts;
    }

    const NextShifts = (props) => {
        let upcomingShifts = get_upcomming_shifts(props.data, 5);

        return (
            <>
                {
                    upcomingShifts.length > 0 ? 
                    upcomingShifts.map((shift, index) => {
                        return(
                            <div className="upcoming_shift" id={shift._id} key={`upcoming_${index}`}>
                                <p className="upcoming_shift_date">{to_standard_date(shift.date)}</p>
                                <div className="upcoming_shift_info">
                                    <p>Your job: {shift.job}<br/>
                                    Starts at: {shift.start_time} &nbsp; &nbsp; / &nbsp; &nbsp; ends at: {shift.end_time}</p>
                                </div>
                            </div>
                        )
                    })
                    : 
                    <div className="no_upcoming_shifts">
                        <div className="no_upcoming_shifts_text">
                            <p>You don't have any shifts awaiting <i className="far fa-grin-beam-sweat"></i></p>
                            <p>Apply for work by adding shifts to wishlist</p>
                        </div>
                        <button className="add_to_wishlist_btn btn mr-1 formBtn" onClick={() => { window.location.href="/shifts/create" }}>
                            <i className="fa fa-plus mr-2"></i><span>Add shifts to wishlist</span>
                        </button>
                    </div>
                }
            </>
        )
    }

    useEffect(() => {
        const fetch_shift_today = async () => {
            const localUser = get_local_user_data();
            const user_id = localUser._id;
            let token = get_local_user_token();
            if (token) {
                let myHeaders = new Headers();
                myHeaders.append("Authorization", `Bearer ${token}`);
                let requestOptions = {
                    method: 'GET',
                    headers: myHeaders,
                    redirect: 'follow'
                };
        
                let status_code;
                await fetch(`https://${get_ip(device_type)}/shifts/${user_id}`, requestOptions)
                .then(response => {
                    status_code = response.status;
                    // console.log(response);
                    return response.json()
                })
                .then(result => {
                    if (status_code === 200) {
                        // console.log(result);
                        setShiftData(result.shifts);
                    }
                })
                .catch(error => console.log('error', error));
            }
        }

        fetch_shift_today();
    }, [])
    
    return <div className="upcoming_shifts_wrapper">  
        <h5>Upcoming shifts</h5>
        <div className="upcoming_shifts_container">
            <NextShifts data={shiftData} />
        </div>   
    </div>
}

export default UpcomingShifts;