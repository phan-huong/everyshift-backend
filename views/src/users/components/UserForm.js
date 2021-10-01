import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { to_raw_date } from '../../shared/functions/FormatDate';
import { isEmptyObject, get_local_user_data, update_local_user_data } from '../../shared/functions/General';
import { get_ip, device_type } from '../../shared/components/localhost';

import "bootstrap/dist/css/bootstrap.css";
import './UserForm.css';

const UserForm = (props) => {
    const [localUser, setLocalUser] = useState(get_local_user_data())

    // Prepare data
    const user_data = props.data;
    const user_role = user_data.role ? user_data.role : '';
    const first_name = user_data.firstName ? user_data.firstName : '';
    const last_name = user_data.lastName ? user_data.lastName : '';
    const email = user_data.email ? user_data.email : '';
    const dateOfBirth = to_raw_date(user_data.dateOfBirth);
    const gender = user_data.gender ? user_data.gender : '';
    const streetHouseNr = user_data.streetHouseNr ? user_data.streetHouseNr : '';
    const city = user_data.city ? user_data.city : '';
    const postalCode = user_data.postalCode ? user_data.postalCode : '';
    const state = user_data.state ? user_data.state : '';
    const phone = user_data.phone ? user_data.phone : '';
    const country = user_data.country ? user_data.country : '';
    const salary = user_data.salary ? user_data.salary : '';
    const entryDate = to_raw_date(user_data.entryDate);
    const daysOffCount = user_data.daysOffCount ? user_data.daysOffCount : 0;
    
    // form validation rules 
    const validationSchema = Yup.object().shape({
        form_signup: Yup.number(),
        firstName: Yup.string()
            .required('First Name is required'),
        lastName: Yup.string()
            .required('Last name is required'),
        email: Yup.string()
            .required('Email is required')
            .email('Email is invalid'),
        role: Yup.string().when('form_signup', {
            is: 1,
            then: Yup.string().required('Position is required')
        }),
        dateOfBirth: Yup.string()
            .required('Date of birth is required')
            .matches(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/, 'Date of Birth must be a valid date in the format YYYY-MM-DD'),
        gender: Yup.string()
            .required('Gender is required'),
        phone: Yup.string()
            .required('Phone is required'),
        streetHouseNr: Yup.string()
            .required('Adress is required'),
        postalCode: Yup.number().positive().integer()
            .required('Postal code is required')
            .typeError('Postal code must be a positive number'),
        city: Yup.string()
            .required('City is required'),
        state: Yup.string()
            .required('State is required'),
        country: Yup.string()
            .required('Country is required'),
        salary: Yup.number().positive().integer()
            .required('Salary is required')
            .typeError('Postal code must be a positive number'),
        entryDate: Yup.string().default(function () {
                return new Date();
            })
            .matches(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/, 'Entry date must be a valid date in the format YYYY-MM-DD')
            .required('Entry Date is required'),
        daysOffCount: Yup.number().positive().integer(),
        password: Yup.string().when('form_signup', {
            is: 1,
            then: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
            otherwise: Yup.string().when('password', {
                is: (val) => val !== '',
                then: Yup.string().min(6, 'Password must be at least 6 characters'),
                otherwise: Yup.string()
            })
        }),
        confirmPassword: Yup.string().when('password', {
            is: (val) => val !== '',
            then: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required'),
            otherwise: Yup.string()
        })
        // acceptTerms: Yup.bool()
        //     .oneOf([true], 'Accept Ts & Cs is required')
    });
    const formOptions = { resolver: yupResolver(validationSchema) };

    // useForm() hook
    const { register, handleSubmit, reset, formState } = useForm(formOptions);
    const { errors } = formState;

    const onSubmit = (data) => {
        const update_user_by_id = async (data) => {
            let token = localStorage.getItem("logged_in_token");
            if (token) {
                var myHeaders = new Headers();
                myHeaders.append("Authorization", `Bearer ${token}`);
                myHeaders.append("Content-Type", "application/json");
    
                var raw = JSON.stringify(data);
    
                if (!isEmptyObject(user_data)) {   // update user
                    let requestOptionsPatch = {
                        method: 'PATCH',
                        headers: myHeaders,
                        body: raw,
                        redirect: 'follow'
                    };
                    
                    let status_code;
                    await fetch(`https://${get_ip(device_type)}/users/${user_data._id}`, requestOptionsPatch)
                    .then(response => {
                        status_code = response.status;
                        // console.log(response);
                        return response.json()
                    })
                    .then(result => {
                        if (status_code === 200) {
                            // console.log(result);
                            // alert('Updated successfully!');
                            if (localUser._id === result.edited_user._id) {
                                setLocalUser(result.edited_user);
                                update_local_user_data(result.edited_user);
                                // history.push("/");
                                window.location.href="/"
                            } else {
                                window.location.href="/users/employees"
                                // history.push("/users/employees");
                            }
                        }
                    })
                    .catch(error => {
                        console.log('error', error);
                        alert('Updated failed!');
                    });
                } else {    // Create user
                    let requestOptionsPost = {
                        method: 'POST',
                        headers: myHeaders,
                        body: raw,
                        redirect: 'follow'
                    };
        
                    let status_code;
                    await fetch(`https://${get_ip(device_type)}/users/signup`, requestOptionsPost)
                    .then(response => {
                        status_code = response.status;
                        // console.log(response);
                        return response.json()
                    })
                    .then(result => {
                        if (status_code === 201) {
                            console.log(result);
                            alert('Created successfully!');
                        }
                    })
                    .catch(error => {
                        console.log('error', error);
                        alert('Created failed!');
                    });
                }
            }
        }

        update_user_by_id(data);
    }

    return (
        <div className="signupFormContainer">
            { isEmptyObject(user_data) ? <h4>Create a new account</h4> : <></> }
            <form onSubmit={handleSubmit(onSubmit)}>
                <input name="form_signup" type="hidden" {...register('form_signup')} value={isEmptyObject(props.data) ? 1 : 0} />
                <input name="current_user_id" type="hidden" value={localUser._id ? localUser._id : -1} />

                <div>
                    <label>Position</label>
                    <select 
                        name="role" 
                        {...register('role')} 
                        className={`form-control ${errors.role ? 'is-invalid' : ``}`} 
                        disabled={localUser.role !== 'manager' ? true : false}
                        defaultValue={user_role}
                    >
                        <option value="">Please choose role</option>
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                    </select>
                    <div className="invalid-feedback">{errors.role?.message}</div>
                </div>
                <div>
                    <label>First Name</label>
                    <input name="firstName" type="text" {...register('firstName')} className={`form-control ${errors.firstName ? 'is-invalid' : ''}`} defaultValue={first_name} />
                    <div className="invalid-feedback">{errors.firstName?.message}</div>
                </div>
                <div>
                    <label>Last Name</label>
                    <input name="lastName" type="text" {...register('lastName')} className={`form-control ${errors.lastName ? 'is-invalid' : ''}`} defaultValue={last_name} />
                    <div className="invalid-feedback">{errors.lastName?.message}</div>
                </div>
                <div>
                    <label>Email</label>
                    <input name="email" type="text" placeholder="example@email.com" {...register('email')} className={`form-control ${errors.email ? 'is-invalid' : ''}`} defaultValue={email} />
                    <div className="invalid-feedback">{errors.email?.message}</div>
                </div>
                <div className="field_2col">
                    <div>
                        <label>Date of Birth</label>
                        <input name="dateOfBirth" type="date" {...register('dateOfBirth')} className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`} defaultValue={dateOfBirth} />
                        <div className="invalid-feedback">{errors.dateOfBirth?.message}</div>
                    </div>
                    <div>
                        <label>Gender</label>
                        <select name="gender" {...register('gender')} className={`form-control ${errors.gender ? 'is-invalid' : ''}`} defaultValue={gender}>
                            <option value=""></option>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="other">Other</option>
                        </select>
                        <div className="invalid-feedback">{errors.gender?.message}</div>
                    </div>
                </div>
                <div>
                    <label>Phone</label>
                    <input name="phone" type="tel" placeholder="+49 12345678910" pattern="+[0-9]{2} [0-9]{11}" {...register('phone')} className={`form-control ${errors.phone ? 'is-invalid' : ''}`}  defaultValue={phone}/>
                    <div className="invalid-feedback">{errors.phone?.message}</div>
                </div>
                <p>Adress</p>
                <div>
                    <label>Street, House number</label>
                    <input name="streetHouseNr" type="text" {...register('streetHouseNr')} className={`form-control ${errors.streetHouseNr ? 'is-invalid' : ''}`} defaultValue={streetHouseNr} />
                    <div className="invalid-feedback">{errors.streetHouseNr?.message}</div>
                </div>
                <div className="field_2col">
                    <div>
                        <label>City</label>
                        <input name="city" type="text" {...register('city')} className={`form-control ${errors.city ? 'is-invalid' : ''}`} defaultValue={city} />
                        <div className="invalid-feedback">{errors.city?.message}</div>
                    </div>
                    <div>
                        <label>Postal Code</label>
                        <input name="postalCode" type="text" {...register('postalCode')} className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`} defaultValue={postalCode} />
                        <div className="invalid-feedback">{errors.postalCode?.message}</div>
                    </div>
                    <div>
                        <label>State</label>
                        <input name="state" type="text" {...register('state')} className={`form-control ${errors.state ? 'is-invalid' : ''}`} defaultValue={state} />
                        <div className="invalid-feedback">{errors.state?.message}</div>
                    </div>
                    <div>
                        <label>Country</label>
                        <input name="country" type="text" {...register('country')} className={`form-control ${errors.country ? 'is-invalid' : ''}`} defaultValue={country} />
                        <div className="invalid-feedback">{errors.country?.message}</div>
                    </div>
                </div>
                <div className="field_2col">
                    <div>
                        <label>Salary</label>
                        <input name="salary" type="number" min="1" {...register('salary')} className={`form-control ${errors.salary ? 'is-invalid' : ''}`} defaultValue={salary} />
                        <div className="invalid-feedback">{errors.salary?.message}</div>
                    </div>
                    <div>
                        <label>Days-off</label>
                        <input name="daysOffCount" type="number" min={0} step={1} {...register('daysOffCount')} className={`form-control ${errors.daysOffCount ? 'is-invalid' : ''}`}  defaultValue={daysOffCount}/>
                        <div className="invalid-feedback">{errors.daysOffCount?.message}</div>
                    </div>
                </div>
                <div>
                    <label>Entry date</label>
                    <input name="entryDate" type="date" {...register('entryDate')} className={`form-control ${errors.entryDate ? 'is-invalid' : ''}`} defaultValue={entryDate} />
                    <div className="invalid-feedback">{errors.entryDate?.message}</div>
                </div>
                <div className={ localUser._id === user_data._id || isEmptyObject(user_data) ? '' : 'd-none' }>
                    <label>Password</label>
                    <input name="password" type="password" {...register('password')} className={`form-control ${errors.password ? 'is-invalid' : ''}`} />
                    <div className="invalid-feedback">{errors.password?.message}</div>
                </div>
                <div className={ localUser._id === user_data._id || isEmptyObject(user_data) ? '' : 'd-none' }>
                    <label>Confirm Password</label>
                    <input name="confirmPassword" type="password" {...register('confirmPassword')} className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} />
                    <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                </div>
                {/* {
                    props.type === 'sign_up' ? 
                        <div className="checkTerms">
                            <input name="acceptTerms" type="checkbox" {...register('acceptTerms')} id="acceptTerms" className={`form-check-input ${errors.acceptTerms ? 'is-invalid' : ''}`} />
                            <label htmlFor="acceptTerms" className="form-check-label">Accept Terms & Conditions</label>
                            <div className="invalid-feedback">{errors.acceptTerms?.message}</div>
                        </div> :
                        <></>
                } */}
                <div>
                    <button type="submit" className="btn mr-1 formBtn">Apply</button>
                    <button type="button" onClick={() => reset()} className="btn btn-secondary">Reset</button>
                </div>
            </form>
        </div>
    )
};

export default UserForm;