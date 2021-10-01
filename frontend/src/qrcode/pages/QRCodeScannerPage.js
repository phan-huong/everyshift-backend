import React, { useState } from 'react';
import QrReader from 'react-qr-reader';
import { get_local_user_data, get_local_user_token } from '../../shared/functions/General';
import { to_raw_date, to_raw_time, is_time_in_range, compare_date_standard } from '../../shared/functions/FormatDate';
import { get_ip, device_type } from '../../shared/components/localhost';

import './QRCodePage.css';

const QRCodeScannerPage = () => {
    const [qrCodeData, setrCodeData] = useState();
    const userData = get_local_user_data();

    const update_shift_by_id = async (found_shift) => {
        if (found_shift.status === "done") {
            alert("This employee has already checked-in the current shift.");
        } else {
            let token = get_local_user_token();
            var myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);
            myHeaders.append("Content-Type", "application/json");

            let new_data = {
                date: to_raw_date(new Date(found_shift.date)),
                job: found_shift.job,
                start_time: found_shift.start_time,
                end_time: found_shift.end_time,
                status: "done",
                worker: found_shift.worker
            }

            let requestOptionsPatch = {
                method: 'PATCH',
                headers: myHeaders,
                body: JSON.stringify(new_data),
                redirect: 'follow'
            };
            
            let update_status_code;
            await fetch(`https://${get_ip(device_type)}/shifts/${found_shift._id}`, requestOptionsPatch)
            .then(response => {
                update_status_code = response.status;
                // console.log(response);
                return response.json()
            })
            .then(result => {
                if (update_status_code === 200) {
                    console.log(result);
                    alert('Check-in successfully!');
                    window.location.href="/calendar"
                } else {
                    alert('Check-in failed!');
                    window.location.href="/qrcodeviewer";
                }
            })
            .catch(error => {
                console.log('error', error);
                alert('There are technical error, please try again later!');
                window.location.href="/qrcodeviewer";
            });
        }
    }

    const update_shift_status = async (user_id) => {
        let token = get_local_user_token();
        let date_now = new Date();
        let time_now = to_raw_time(date_now);

        if (token) {
            var myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);

            let requestOptionsGet = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            };
            
            // First get all shifts by user ID
            var status_code;
            await fetch(`https://${get_ip(device_type)}/shifts/${user_id}`, requestOptionsGet)
            .then(response => {
                status_code = response.status;
                return response.json()
            })
            .then(result => {
                if (status_code === 200) {
                    // Then Check if the moment after scanning of QR Code is in any shift
                    let user_shifts = result.shifts;
                    console.log(user_shifts);

                    if (user_shifts) {
                        // Find a shift at the moment of scanning
                        let found_shift;
                        for (const user_shift of user_shifts) {
                            console.log(compare_date_standard(date_now, new Date(user_shift.date)));
                            if (compare_date_standard(date_now, new Date(user_shift.date)) && 
                                is_time_in_range(time_now, user_shift.start_time, user_shift.end_time)) 
                            {
                                found_shift = user_shift;
                                break;
                            }
                        }

                        // If a shift was found, then starting to update its status
                        if (found_shift) {
                            update_shift_by_id(found_shift);
                        } else {
                            alert("This employee doesn't have a shift right now!");
                            window.location.href="/qrcodeviewer";
                        }
                    } else {
                        alert("This employee hasn't had any shifts yet!");
                        window.location.href="/qrcodeviewer";
                    }
                }
            })
            .catch(error => console.log('error', error));
        }
    }

    const handleScan = (data) => {
        if (data) {
            console.log(data);
            update_shift_status(data);
        }
    }

    const handleError = (err) => {
        alert("Unable to access the camera!")
        console.error(err);
    }

    return (
        <div className="qrcode_page">
            <div className="qrcode_wrapper">
                <div className="title_section">QR Code Scanner</div>
                
                <div className="main_content">
                    <QrReader
                        delay={300}
                        onError={handleError}
                        onScan={handleScan}
                        style={{ width: '100%' }}
                    />
                </div>
                
                <div className="buttons_section">
                    <span className="text-info font-italic">Hold your camera over a QR Code to scan...</span>
                </div>
            </div>
        </div>
    )
}

export default QRCodeScannerPage;