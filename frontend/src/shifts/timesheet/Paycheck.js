import React, { useState, useEffect} from 'react';
import { get_local_user_data, sort_by_date, get_local_user_token } from '../../shared/functions/General';
import { to_standard_date, get_this_month, get_this_year, get_hour_as_number } from '../../shared/functions/FormatDate';
import { get_ip, device_type } from '../../shared/components/localhost';
import { useForm } from "react-hook-form";
import Table from 'react-bootstrap/Table'

import './Paycheck.css';

const Paycheck = () => {
    const [shiftData, setShiftData] = useState([]);
    const localUser = get_local_user_data();
    const user_id = localUser._id;
    const user_salary = localUser.salary;
    // console.log(user_salary)

    const this_year = new Date().getFullYear().toString();
    const this_month = new Date().getMonth();

    useEffect(() => {
        const fetch_shifts = async () => {
            let token = localStorage.getItem("logged_in_token");
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
        fetch_shifts();

    }, [])

    const { register } = useForm();

    const [month, setMonth] = useState(`${this_month}`);

    const handleChange = (e) => {
        setMonth(e.target.value);
    }

    let month_salary = 0;

    const display_shifts = () => {
        const sorted_shift_data = sort_by_date(shiftData);
        let sorted_shift_done = [];
        let display_elements = [];
        
        for (const sorted_shift of sorted_shift_data) {
            let shift_month = get_this_month(sorted_shift.date);
            let shift_year = get_this_year(sorted_shift.date);
            if ((sorted_shift.status === 'done') && (shift_month === month) && (shift_year === this_year)) {
                sorted_shift_done.push(sorted_shift);
            }
        }       

        for (const this_shift of sorted_shift_done) {
            let start_shift = this_shift.start_time;
            let end_shift = this_shift.end_time;
            let start = get_hour_as_number(start_shift);
            let end = get_hour_as_number(end_shift);
            let work_hours = end - start;
            month_salary += (work_hours * user_salary);
        }

        for (const shift of sorted_shift_done) {
            let el = <tr key={shift._id}>
                <td>{to_standard_date(shift.date)}</td>
                <td>{shift.start_time}</td>
                <td>{shift.end_time}</td>
                <td><span className="badge badge-pill badge-success">{shift.status}</span></td>
            </tr>
            display_elements.push(el);
        } return display_elements;

    } 
    
    return <div className="wishlist_wrapper">  
        <div className="wishlist_controller">
            <p>{this_year}</p>
            <form className="sort_by">
                <label>Month:</label>
                <select name="month" {...register('month')} defaultValue={`${this_month}`} onChange={handleChange}>
                    <option value="1">Jan</option>
                    <option value="2">Feb</option>
                    <option value="3">Mar</option>
                    <option value="4">Apr</option>
                    <option value="5">May</option>
                    <option value="6">Jun</option>
                    <option value="7">Jul</option>
                    <option value="8">Aug</option>
                    <option value="9">Sep</option>
                    <option value="10">Oct</option>
                    <option value="11">Nov</option>
                    <option value="12">Dec</option>
                </select>
            </form>
        </div>
        <div className="wishlist_table">
            <Table striped bordered>
                <thead>
                    <tr>
                        <td>Date</td>
                        <td>Start</td>
                        <td>End</td>
                        <td>Status</td>
                    </tr>
                </thead>
                <tbody>
                    {display_shifts()}
                </tbody>
            </Table>
        </div>
        <div className="pay_check">Brutto monthly salary: {`${month_salary}`} €</div>
    </div>
}

export default Paycheck;