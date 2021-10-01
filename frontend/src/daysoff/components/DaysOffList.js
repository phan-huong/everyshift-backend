import React, { useState } from "react";
import { get_ip, device_type } from "../../shared/components/localhost";
import { sort_by_date_from_db, get_local_user_token } from '../../shared/functions/General';
import { to_standard_date, get_this_year_only, to_raw_date } from "../../shared/functions/FormatDate";

const DaysOffList = (props) => {
    const filter_daysoff = () => {
        let userData = props.userData;
        let count = userData.daysOffCount || 24;
        let list = userData.daysOff || [];
        let sorted_list = sort_by_date_from_db(list);

        function get_years(dates_list) {
            let years = [];
            let tempo_year = 0;
            for (const date_str of dates_list) {
                let new_date = new Date(date_str);
                let new_year = new_date.getFullYear();
                if (!years.includes(new_year)) {
                    years.push(new_year)
                }
            }

            // console.log(years);
            return years;
        }

        return { 
            count: count, 
            years: get_years(sorted_list), 
            list: sorted_list
        };
    }
    const daysOffData = filter_daysoff();

    const delete_daysoff = async (raw_date) => {
        let token = get_local_user_token();
        if (token) {
            var myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({ "dates": [raw_date] });

            var requestOptions = {
                method: 'PATCH',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            let status_code;
            await fetch(`https://${get_ip(device_type)}/users/${props.userData._id}/daysoff/delete`, requestOptions)
            .then(response => {
                status_code = response.status;
                // console.log(response);
                return response.json()
            })
            .then(result => {
                if (status_code === 200) {
                    // console.log(result);
                    alert('Deleted successfully!');
                    props.update_userData(result.edited_user);
                }

                if (status_code === 500) {
                    alert(result.message);
                }
            })
            .catch(error => {
                console.log('error', error);
                alert('Deleted failed!');
            });
        }
    }

    return (
        <>
            <ul id="year_accordion" className="year_list list-group border">
                {
                    daysOffData.years.length > 0 ? 
                    daysOffData.years.map((year, y_index) => {
                        return(
                            <li className="year_item" key={`year_${y_index}`}>
                                <a href={`#year_item_${y_index}`} 
                                    className="year_item_link list-group-item list-group-item-action list-group-item-primary" 
                                    data-toggle="collapse"
                                >
                                    <span className="title">{`Days-off in ${year}`}</span>
                                    <i className="icon fa fa-chevron-down arrow_rotate"></i>
                                </a>
                                <div id={`year_item_${y_index}`} className={`collapse ${get_this_year_only() === year ? 'show' : ''}`} data-parent="#year_accordion">
                                    <div className="card-body">
                                        { 
                                            daysOffData.list.length > 0 ?
                                            daysOffData.list.map((daysoff, d_index) => {
                                                let new_date = new Date(daysoff);
                                                let pretty_date = to_standard_date(daysoff); // DD-MM-YYYY
                                                let raw_date = to_raw_date(daysoff); // YYYY-MM-DD
                                                let base_year = new_date.getFullYear();
                                                // let base_month = new_date.getMonth();
                                                // let base_date = new_date.getDate()

                                                if (base_year !== year) return null;

                                                return (
                                                    <div className="input-group input-group-sm mb-1" key={`daysoff_group_${d_index}`}>
                                                        <input type="text" className="form-control shadow-none" value={pretty_date} readOnly={true} />
                                                        <div className="input-group-append">
                                                            <button className="btn btn-outline-danger shadow-none" type="button" onClick={() => { delete_daysoff(raw_date) }}>
                                                                <i className="fa fa-times"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            }) : null
                                        }
                                    </div>
                                </div>
                            </li>
                        )
                    })
                    : <li class="list-group-item list-group-item-warning"><i class="fa fa-exclamation-circle"></i> No days-off found.</li>
                }
            </ul>
        </>
    )
}

export default DaysOffList;