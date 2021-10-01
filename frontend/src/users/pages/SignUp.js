import React from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { get_ip, device_type } from '../../shared/components/localhost';
import './SignUp.css';

const SignUp = () => {
    // form validation rules 
    const validationSchema = Yup.object().shape({
        firstName: Yup.string()
            .required('First Name is required'),
        lastName: Yup.string()
            .required('Last name is required'),
        email: Yup.string()
            .required('Email is required')
            .email('Email is invalid'),
        role: Yup.string()
            .required('Position is required'),
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
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),        
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm Password is required'),
        acceptTerms: Yup.bool()
            .oneOf([true], 'Accept Ts & Cs is required')
    });
    const formOptions = { resolver: yupResolver(validationSchema) };

    // useForm() hook
    const { register, handleSubmit, reset, formState } = useForm(formOptions);
    const { errors } = formState;

    const onSubmit = async (data) => {
        // display form data on success
        // alert('SUCCESS!! :-)\n\n' + JSON.stringify(data, null, 4));
        // return false;
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(data);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        await fetch(`https://${get_ip(device_type)}/users/signup`, requestOptions)
        .then(response => {
            console.log(response);
            if (response.status === 201) alert('Success!'); else alert('Failed!');
            return response.json()
        })
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
    }

    return (
        <div className="signupFormContainer">
            <h4>Create a new account</h4>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>Position</label>
                    <select name="role" {...register('role')} className={`form-control ${errors.role ? 'is-invalid' : ''}`}>
                        <option value=""></option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                    </select>
                    <div className="invalid-feedback">{errors.role?.message}</div>
                </div>
                <div>
                    <label>First Name</label>
                    <input name="firstName" type="text" {...register('firstName')} className={`form-control ${errors.firstName ? 'is-invalid' : ''}`} />
                    <div className="invalid-feedback">{errors.firstName?.message}</div>
                </div>
                <div>
                    <label>Last Name</label>
                    <input name="lastName" type="text" {...register('lastName')} className={`form-control ${errors.lastName ? 'is-invalid' : ''}`} />
                    <div className="invalid-feedback">{errors.lastName?.message}</div>
                </div>
                <div>
                    <label>Email</label>
                    <input name="email" type="text" placeholder="example@email.com" {...register('email')} className={`form-control ${errors.email ? 'is-invalid' : ''}`} />
                    <div className="invalid-feedback">{errors.email?.message}</div>
                </div>
                <div className="field_2col">
                    <div>
                        <label>Date of Birth</label>
                        <input name="dateOfBirth" type="date" {...register('dateOfBirth')} className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors.dateOfBirth?.message}</div>
                    </div>
                    <div>
                        <label>Gender</label>
                        <select name="gender" {...register('gender')} className={`form-control ${errors.gender ? 'is-invalid' : ''}`}>
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
                    <input name="phone" type="tel" placeholder="+49 12345678910" pattern="+[0-9]{2} [0-9]{11}" {...register('phone')} className={`form-control ${errors.phone ? 'is-invalid' : ''}`} />
                    <div className="invalid-feedback">{errors.phone?.message}</div>
                </div>
                <p>Adress</p>
                <div>
                    <label>Street, House number</label>
                    <input name="streetHouseNr" type="text" {...register('streetHouseNr')} className={`form-control ${errors.streetHouseNr ? 'is-invalid' : ''}`} />
                    <div className="invalid-feedback">{errors.streetHouseNr?.message}</div>
                </div>
                <div className="field_2col">
                    <div>
                        <label>City</label>
                        <input name="city" type="text" {...register('city')} className={`form-control ${errors.city ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors.city?.message}</div>
                    </div>
                    <div>
                        <label>Postal Code</label>
                        <input name="postalCode" type="text" {...register('postalCode')} className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors.postalCode?.message}</div>
                    </div>
                    <div>
                        <label>State</label>
                        <input name="state" type="text" {...register('state')} className={`form-control ${errors.state ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors.state?.message}</div>
                    </div>
                    <div>
                        <label>Country</label>
                        <input name="country" type="text" {...register('country')} className={`form-control ${errors.country ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors.country?.message}</div>
                    </div>
                </div>
                <div className="field_2col">
                    <div>
                        <label>Salary</label>
                        <input name="salary" type="number" min="1" {...register('salary')} className={`form-control ${errors.salary ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors.salary?.message}</div>
                    </div>
                    <div>
                        <label>Entry date</label>
                        <input name="entryDate" type="date" {...register('entryDate')} className={`form-control ${errors.entryDate ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors.entryDate?.message}</div>
                    </div>
                </div>
                <div>
                    <label>Password</label>
                    <input name="password" type="password" {...register('password')} className={`form-control ${errors.password ? 'is-invalid' : ''}`} />
                    <div className="invalid-feedback">{errors.password?.message}</div>
                </div>
                <div>
                    <label>Confirm Password</label>
                    <input name="confirmPassword" type="password" {...register('confirmPassword')} className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} />
                    <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                </div>
                <div className="checkTerms">
                    <input name="acceptTerms" type="checkbox" {...register('acceptTerms')} id="acceptTerms" className={`form-check-input ${errors.acceptTerms ? 'is-invalid' : ''}`} />
                    <label htmlFor="acceptTerms" className="form-check-label">Accept Terms & Conditions</label>
                    <div className="invalid-feedback">{errors.acceptTerms?.message}</div>
                </div>
                <div>
                    <button type="submit" className="btn mr-1 formBtn">Register</button>
                    <button type="button" onClick={() => reset()} className="btn btn-secondary">Reset</button>
                </div>
            </form>
        </div>
    )
};

export default SignUp;