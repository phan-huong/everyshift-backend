import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { get_ip, device_type } from '../../shared/components/localhost';
import { get_local_user_token } from '../../shared/functions/General';

import ShiftForm from '../components/ShiftForm';

const ShiftDetails = (props) => {
    const [shiftData, setShiftData] = useState();
    let shift_id = useParams().id;

    useEffect(() => {
        const fetch_shift_details = async () => {
            let token = get_local_user_token();
            if (token) {
                if (!shiftData && shift_id !== 'create') {
                    var myHeaders = new Headers();
                    myHeaders.append("Authorization", `Bearer ${token}`);
                    var requestOptions = {
                        method: 'GET',
                        headers: myHeaders,
                        redirect: 'follow'
                    };
            
                    var status_code;
                    await fetch(`https://${get_ip(device_type)}/shifts/shift/${shift_id}`, requestOptions)
                    .then(response => {
                        status_code = response.status;
                        return response.json()
                    })
                    .then(result => {
                        if (status_code === 200) {
                            // console.log(result);
                            setShiftData(result.shift);
                        }
                    })
                    .catch(error => console.log('error', error));
                } else {
                    setShiftData({});
                }
            }
        }
        
        fetch_shift_details();
    }, [])

    return (
        <>
            { shiftData ?
                <ShiftForm data={shiftData} type="full" /> : <></>
            }
        </>
    )
}

export default ShiftDetails;