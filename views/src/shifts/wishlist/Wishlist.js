import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { get_local_user_data, sort_by_date, get_local_user_token } from '../../shared/functions/General';
import { to_standard_date } from '../../shared/functions/FormatDate';
import { get_ip, device_type } from '../../shared/components/localhost';
import { useForm } from "react-hook-form";
import Table from 'react-bootstrap/Table'

import './Wishlist.css';

const Wishlist = () => {
    const [shiftData, setShiftData] = useState([]);
    const localUser = get_local_user_data();
    const user_id = localUser._id;

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

    const delete_shift = async (props) => {
        let token = get_local_user_token();
        if (token) {
            let myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);

            let requestOptionsDelete = {
                method: 'DELETE',
                headers: myHeaders,
                redirect: 'follow'
            };

            let status_code;
            await fetch(`https://${get_ip(device_type)}/shifts/delete/${props}`, requestOptionsDelete)
            .then(response => {
                status_code = response.status;
                return response.json()
            })
            .then(result => {
                if (status_code === 200) {
                    console.log(result);
                    alert('Deleted successfully!');
                    if (props.type === 'quick') {
                        // history.push("/");
                        window.location.href="/calendar"
                    } else {
                        window.location.href="/timesheet"
                        // history.push("/users/employees");
                    }
                }
            })
            .catch(error => {
                console.log('error', error);
                alert('Deleted failed!');
            });
        }
    }

    // useForm() hook
    const { register } = useForm();

    const [sortingValue, setSortingValue] = useState('by_date');

    const handleChange = (e) => {
        setSortingValue(e.target.value);
    }

    const display_shifts = () => {
        const sorted_shift_data = sort_by_date(shiftData);
        let sorted_shift_accepted = [];
        let sorted_shift_pending = [];
        let display_shifts = [];
        let display_elements = [];
        
        if (sortingValue === 'by_date') {
            for (const sorted_shift of sorted_shift_data) {
                if (sorted_shift.status === 'accepted' || sorted_shift.status === 'pending') {
                    display_shifts.push(sorted_shift);
                }
            }
        } else if (sortingValue === 'by_status') {
            for (const sorted_shift of sorted_shift_data) {
                if (sorted_shift.status === 'pending') {
                    sorted_shift_pending.push(sorted_shift);
                }
                if (sorted_shift.status === 'accepted') {
                    sorted_shift_accepted.push(sorted_shift);
                }
            }
            for (const pending of sorted_shift_pending) {
                display_shifts.push(pending);
            }
            for (const accepted of sorted_shift_accepted) {
                display_shifts.push(accepted);
            }
        }

        for (const shift of display_shifts) {
            let el = <tr key={shift._id}>
                <td>{to_standard_date(shift.date)}</td>
                <td>{shift.start_time}</td>
                <td>{shift.end_time}</td>
                <td><span className={`badge badge-pill ${(shift.status === 'accepted') ? 'badge-primary' : 'badge-warning'}`}>{shift.status}</span></td>
                <td className="wishlist_actions">{(shift.status === 'pending') ? 
                    <div className="wishlist_pending">
                        <button onClick={() => { delete_shift(`${shift._id}`) }}><i className="fas fa-trash-alt"></i></button>
                        <Link to={`/shifts/${shift._id}`}><i className="fas fa-edit"></i></Link>
                    </div> : <button onClick={() => { delete_shift(`${shift._id}`) }}><i className="fas fa-trash-alt"></i></button> }
                </td>
            </tr>
            display_elements.push(el);
        } return display_elements;
    } 
    
    return <div className="wishlist_wrapper">  
        <div className="wishlist_controller">
            <button className="wishlist_btn btn mr-1 formBtn" onClick={() => { window.location.href="/shifts/create" }}>
                <i className="fa fa-plus mr-2"></i><span>New</span>
            </button>
            <form className="sort_by">
                <label>Sorted by:</label>
                <select name="sorted_by" {...register('sorted_by')} defaultValue={"by_date"} onChange={handleChange}>
                    <option value="by_date">Date</option>
                    <option value="by_status">Status</option>
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
                        <td>Actions</td>
                    </tr>
                </thead>
                <tbody>
                    {display_shifts()}
                </tbody>
            </Table>
        </div>
    </div>
}

export default Wishlist;