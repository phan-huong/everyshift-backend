import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { get_ip, device_type } from '../../shared/components/localhost';
import { isEmptyObject, get_local_user_token, get_local_user_data, check_if_manager } from '../../shared/functions/General';


const AddDaysOff = (props) => {
    // form validation rules 
    const validationSchema = Yup.object().shape({
        from_date: Yup.string().required('Single / From date is required'),
        to_date: Yup.string()
    });
    const formOptions = { resolver: yupResolver(validationSchema) };

    // useForm() hook
    const { register, handleSubmit, reset, formState } = useForm(formOptions);
    const { errors } = formState;

    const onSubmit = (data) => {
        const create_daysoff = async (data) => {
            let token = get_local_user_token();
            if (token) {
                var myHeaders = new Headers();
                myHeaders.append("Authorization", `Bearer ${token}`);
                myHeaders.append("Content-Type", "application/json");

                var raw = JSON.stringify(data);

                var requestOptions = {
                    method: 'PATCH',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'follow'
                };

                let status_code;
                await fetch(`https://${get_ip(device_type)}/users/${props.userData._id}/daysoff/create`, requestOptions)
                .then(response => {
                    status_code = response.status;
                    // console.log(response);
                    return response.json()
                })
                .then(result => {
                    if (status_code === 200) {
                        // console.log(result);
                        alert('Added successfully!');
                        props.update_userData(result.edited_user);
                    }

                    if (status_code === 500) {
                        alert(result.message);
                    }
                })
                .catch(error => {
                    console.log('error', error);
                    alert('Added failed!');
                });
            }
        }
        create_daysoff(data);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Choose a single / from date */}
            <div>
                <label>Single / From date</label>
                <input name="from_date" type="date" {...register('from_date')} className={`form-control ${errors.from_date ? 'is-invalid' : ''}`} />
                <div className="invalid-feedback">{errors.from_date?.message}</div>
            </div>

            {/* Choose to date */}
            <div>
                <label>To date</label>
                <input name="to_date" type="date" {...register('to_date')} className={`form-control ${errors.to_date ? 'is-invalid' : ''}`} />
                <div className="invalid-feedback">{errors.to_date?.message}</div>
            </div>

            {/* Action buttons */}
            <div className="action_buttons mt-4">
                <div className="left_btns">
                    <button type="submit" className="btn btn-success mr-1">Apply</button>
                    <button type="button" onClick={() => reset()} className="btn btn-secondary">Reset</button>
                </div>
            </div>
        </form>
    )
}

export default AddDaysOff;