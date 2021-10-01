import React, { useState } from 'react';
import ReactDOM from "react-dom";
import { get_local_user_data, update_local_user_data } from '../../shared/functions/General';
import { CustomModal, open_custom_modal, close_custom_modal } from '../../shared/components/UIElements/CustomModal';
import DaysOffList from '../components/DaysOffList';
import AddDaysOff from '../components/AddDaysOff';

import './DaysOff.css';

const Daysoff = () => {
    const [userData, setuserData] = useState(get_local_user_data());

    const update_userData = (new_data) => {
        update_local_user_data(new_data);
        setuserData(new_data);
        close_custom_modal("create_daysoff_modal");
        // console.log(new_data);
    }

    const modal_action = () => {
        ReactDOM.render(<AddDaysOff userData={userData} update_userData={update_userData} />, document.getElementById("create_daysoff_modal_content"))
        open_custom_modal("create_daysoff_modal")
    }

    return (
        <div className="daysoff_page">
            <div className="daysoff_wrapper">
                <div className="title_section">Your days-off</div>
                
                <div className="main_content">
                    <DaysOffList userData={userData} update_userData={update_userData} />
                </div>
                
                <div className="add_days_off_section">
                    <button className="btn formBtn" onClick={() => { modal_action() }}>
                        <i className="fa fa-plus mr-2"></i><span>Add days-off</span>
                    </button>
                </div>
            </div>
            <CustomModal
                id="create_daysoff_modal" 
                main_content_id="create_daysoff_modal_content"
                title="Add days-off"
                has_footer={false} 
            />
        </div>
    )
}

export default Daysoff;