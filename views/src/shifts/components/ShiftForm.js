import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { to_raw_date, compare_date_standard } from '../../shared/functions/FormatDate';
import { isEmptyObject, get_local_user_token, get_local_user_data, check_if_manager } from '../../shared/functions/General';
import { get_ip, device_type } from '../../shared/components/localhost';

const ShiftForm = (props) => {
    // Prepare data
    const localUser = get_local_user_data();
    const [employeeList, setEmployeeList] = useState([]);

    const shift_data = props.data;
    const worker = isEmptyObject(shift_data) ? localUser._id : shift_data.worker._id || shift_data.worker || localUser._id;
    const shift_date = to_raw_date(shift_data.date);
    const start_time = shift_data.start_time ? shift_data.start_time : '';
    const end_time = shift_data.end_time ? shift_data.end_time : '';
    const shift_time = start_time !== '' && end_time !== '' ? `${start_time}-${end_time}` : '';
    const status = shift_data.status ? shift_data.status : 'pending';
    const job = shift_data.job ? shift_data.job : '';

    // form validation rules 
    const validationSchema = Yup.object().shape({
        user_role: Yup.number(),
        worker: Yup.string().when('user_role', {
            is: 1,
            then: Yup.string().required('Employee is required')
        }),
        shift_date: Yup.string().default(function () {
                return new Date();
            })
            .matches(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/, 'Date must be a valid date in the format YYYY-MM-DD')
            .required('Date is required'),
        shift_time: Yup.string().required('Time is required'),
        status: Yup.string().when('user_role', {
            is: 1,
            then: Yup.string().required('Time is required')
        }),
        job: Yup.string()
    });
    const formOptions = { resolver: yupResolver(validationSchema) };

    // useForm() hook
    const { register, handleSubmit, reset, formState } = useForm(formOptions);
    const { errors } = formState;

    const onSubmit = (data) => {
        const check_if_days_off = async (shift_date, worker_id) => {
            let is_days_off = false;
            let token = get_local_user_token();
            // let userData = {}
            if (token) {
                var myHeaders = new Headers();
                myHeaders.append("Authorization", `Bearer ${token}`);

                let requestOptions = {
                    method: 'GET',
                    headers: myHeaders,
                    redirect: 'follow'
                };
        
                let status_code;
                await fetch(`https://${get_ip(device_type)}/users/${worker_id}`, requestOptions)
                .then(response => {
                    status_code = response.status;
                    return response.json()
                })
                .then(result => {
                    if (status_code === 200) {
                        if (result.user_data.daysOff.length > 0) {
                            let input_date = new Date(shift_date);
                            console.log("===> input_date: " + input_date);
                            for (const daysoff of result.user_data.daysOff) {
                                let user_daysoff = new Date(daysoff);
                                if (compare_date_standard(input_date, user_daysoff)) {
                                    console.log("===> user_daysoff: " + user_daysoff);
                                    is_days_off = true
                                    break;
                                }
                            }

                            if (!is_days_off) {update_shift_by_id(data)}
                            else { alert('Cannot have a shift on vacation day. Please choose another date!') }
                        } else {
                            update_shift_by_id(data)
                        }
                    }
                })
                .catch(error => console.log('error', error));
            }
        }

        const update_shift_by_id = async (data) => {
            let token = get_local_user_token();
            if (token) {
                var myHeaders = new Headers();
                myHeaders.append("Authorization", `Bearer ${token}`);
                myHeaders.append("Content-Type", "application/json");

                let final_start_time = data.shift_time.split("-")[0];
                let final_end_time = data.shift_time.split("-")[1];
                let final_data = {
                    date: data.shift_date,
                    job: data.job,
                    start_time: final_start_time,
                    end_time: final_end_time,
                    status: data.status || status,
                    worker: data.worker || worker
                }
                // console.log(final_data);

                var raw = JSON.stringify(final_data);

                if (!isEmptyObject(shift_data)) {   // update shift
                    if (!check_if_manager(localUser) && final_data.status !== "pending") {
                        alert("This shift has been approved/done and can't be updated anymore.");
                    } else {
                        let requestOptionsPatch = {
                            method: 'PATCH',
                            headers: myHeaders,
                            body: raw,
                            redirect: 'follow'
                        };
                        
                        let status_code;
                        await fetch(`https://${get_ip(device_type)}/shifts/${shift_data._id}`, requestOptionsPatch)
                        .then(response => {
                            status_code = response.status;
                            // console.log(response);
                            return response.json()
                        })
                        .then(result => {
                            if (status_code === 200) {
                                console.log(result);
                                // alert('Updated successfully!');
                                if (props.type === 'quick') {
                                    window.location.href="/calendar"
                                } else {
                                    window.location.href="/timesheet"
                                }
                            }
                        })
                        .catch(error => {
                            console.log('error', error);
                            alert('Updated failed!');
                        });
                    }
                } else {    // Create shift
                    // let raw = JSON.stringify(final_data);
                    let requestOptionsPost = {
                        method: 'POST',
                        headers: myHeaders,
                        body: raw,
                        redirect: 'follow'
                    };
        
                    let status_code;
                    await fetch(`https://${get_ip(device_type)}/shifts`, requestOptionsPost)
                    .then(response => {
                        status_code = response.status;
                        // console.log(response);
                        return response.json()
                    })
                    .then(result => {
                        if (status_code === 201) {
                            console.log(result);
                            // alert('Created successfully!');
                            if (props.type === 'quick') {
                                window.location.href="/calendar"
                            } else {
                                window.location.href="/timesheet"
                            }
                        }
                    })
                    .catch(error => {
                        console.log('error', error);
                        alert('Created failed!');
                    });
                }
            }
        }

        // update_shift_by_id(data);
        check_if_days_off(data.shift_date, data.worker || worker)
    }

    const delete_shift = async () => {
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
            await fetch(`https://${get_ip(device_type)}/shifts/delete/${shift_data._id}`, requestOptionsDelete)
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

                if (status_code === 500) {
                    alert(result.message)
                }
            })
            .catch(error => {
                console.log('error', error);
                alert('Deleted failed!');
            });
        }
    }

    useEffect(() => {
        const fetch_all_employees = async () => {
            let token = get_local_user_token();
            if (token) {
                let myHeaders = new Headers();
                myHeaders.append("manager_id", localUser._id ? localUser._id : '');
                myHeaders.append("Authorization", `Bearer ${token}`);

                let requestOptions = {
                    method: 'GET',
                    headers: myHeaders,
                    redirect: 'follow'
                };
    
                let status_code;
                await fetch(`https://${get_ip(device_type)}/users/employees`, requestOptions)
                .then(response => {
                    status_code = response.status;
                    return response.json()
                })
                .then(result => {
                    if (status_code === 200) {
                        let all_employees = result.users;
                        all_employees.unshift(localUser);
                        setEmployeeList(all_employees);
                    }
                })
                .catch(error => console.log('error', error));
            }
        }

        fetch_all_employees();
    }, [])

    return (
        <div className="signupFormContainer">
            <h4>{ isEmptyObject(shift_data) ? "Create a shift" : "Update shift" }</h4>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input name="user_role" type="hidden" {...register('user_role')} value={check_if_manager(localUser) ? 1 : 0} />

                {/* Select employee */}
                {
                    employeeList.length > 0 ?
                    <div className={ check_if_manager(localUser) ? '' : 'd-none' }>
                        <label>Employee</label>
                        <select 
                            id="shift_form_select_employee"
                            defaultValue={worker}
                            name="worker" 
                            {...register('worker')} 
                            className={`form-control ${errors.worker ? 'is-invalid' : ``}`} 
                            disabled={check_if_manager(localUser) ? false : true}
                        >
                            {
                                employeeList.map((employee, index) => {
                                    return (
                                        <option key={`select_employee_${index}`} value={employee._id}>
                                            {employee._id === localUser._id ? 'Myself' : `${employee.firstName} ${employee.lastName}`}
                                        </option>
                                    )
                                })
                            }
                        </select>
                        <div className="invalid-feedback">{errors.worker?.message}</div>
                    </div>
                    : <></>
                }

                {/* Choose date */}
                <div>
                    <label>Date</label>
                    <input name="shift_date" type="date" {...register('shift_date')} className={`form-control ${errors.shift_date ? 'is-invalid' : ''}`} defaultValue={shift_date} />
                    <div className="invalid-feedback">{errors.shift_date?.message}</div>
                </div>

                {/* Select shift/time */}
                <div>
                    <label>Time</label>
                    <select 
                        name="shift_time" 
                        {...register('shift_time')} 
                        className={`form-control ${errors.shift_time ? 'is-invalid' : ``}`} 
                        defaultValue={shift_time}
                    >
                        <option value="">Please choose a shift</option>
                        <option value="06:00-10:00">06:00 - 10:00</option>
                        <option value="10:00-14:00">10:00 - 14:00</option>
                        <option value="14:00-18:00">14:00 - 18:00</option>
                        <option value="18:00-22:00">18:00 - 22:00</option>
                    </select>
                    <div className="invalid-feedback">{errors.shift_time?.message}</div>
                </div>

                {/* Set status */}
                <div className={ check_if_manager(localUser) ? '' : 'd-none' }>
                    <label>Status</label>
                    <select 
                        name="status" 
                        {...register('status')} 
                        className={`form-control ${errors.status ? 'is-invalid' : ``}`} 
                        disabled={check_if_manager(localUser) ? false : true}
                        defaultValue={status}
                    >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        {/* <option value="done">Done</option> */}
                    </select>
                    <div className="invalid-feedback">{errors.status?.message}</div>
                </div>

                {/* Job/Description (not required) */}
                <div>
                    <label>Job</label>
                    <input name="job" type="text" {...register('job')} className={`form-control ${errors.job ? 'is-invalid' : ''}`} defaultValue={job} />
                    <div className="invalid-feedback">{errors.job?.message}</div>
                </div>

                {/* Action buttons */}
                <div className="action_buttons">
                    <div className="left_btns">
                        <button type="submit" className="btn mr-1 formBtn">Apply</button>
                        <button type="button" onClick={() => reset()} className="btn btn-secondary">Reset</button>
                    </div>
                    <div className="right_btns">
                        { status !== 'done' && !isEmptyObject(shift_data) ? 
                            <button type="button" onClick={() => { delete_shift() }} className="btn btn-outline-danger">Delete</button>
                        : <></>}
                    </div>
                </div>
            </form>
        </div>
    )
};

export default ShiftForm;