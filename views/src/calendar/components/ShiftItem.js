import React from "react";
import ReactDOM from "react-dom";
import { get_local_user_data, check_if_manager } from "../../shared/functions/General";
import { to_standard_date } from "../../shared/functions/FormatDate";
import { open_custom_modal } from "../../shared/components/UIElements/CustomModal";

const ShiftItem = (props) => {
    const local_userData = get_local_user_data();
    const multiple_users = Array.isArray(props.shift);

    const set_status_color = (status) => {
        let output;
        switch (status) {
            case 'done':
                output = 'success';
                break;
            case 'accepted':
                output = 'primary';
                break;
            default:
                output = 'warning';
                break;
        }
        return output;
    }

    const set_properties = () => {
        let output = {
            top: 0,
            height: 0,
            colors: []
        };

        let start_time = multiple_users ? props.shift[0].start_time.split(":") : props.shift.start_time.split(":");
        let end_time = multiple_users ? props.shift[0].end_time.split(":") : props.shift.end_time.split(":");
        let final_top = (parseInt(start_time[1]) / 60 + parseInt(start_time[0])) * props.item_height;
        let final_height = ((parseInt(end_time[1]) / 60 + parseInt(end_time[0])) * props.item_height) - final_top;

        let final_colors = [];
        if (!multiple_users) {
            // let new_data = {
            //     value: props.shift,
            //     color: set_status_color(props.shift.status)
            // }
            final_colors.push(set_status_color(props.shift.status));
        } else {
            for (const shift of props.shift) {
                final_colors.push(set_status_color(shift.status));
            }
        }

        output.top = final_top;
        output.height = final_height;
        output.colors = final_colors;

        return output;
    }
    const properties = set_properties();

    const ShiftModalContent = (props) => {
        const multiple_data = Array.isArray(props.data);

        const EmployeeItem = (props) => {
            // console.log(props.data)
            return (
                <a 
                    href={props.data.status !== 'done' ? `/shifts/${props.data._id}` : "#"} 
                    className={`list-group-item list-group-item-action list-group-item-${set_status_color(props.data.status)}`}
                >
                    <div>
                        <span>
                            { 
                                check_if_manager(local_userData) ? 
                                `${props.data.worker.firstName} ${props.data.worker.lastName}`
                                : 'Myself'
                            }
                        </span>
                        <span>{props.data.status}</span>
                    </div>
                    { props.data.status !== 'done' ? <i className="fa fa-pencil"></i> : <></>}
                </a>
            )
        }

        return (
            <>
                <table className="table table-striped table-bordered text-light mt-3">
                    <tbody>
                        <tr>
                            <th>Date</th>
                            <td>{ multiple_data ? to_standard_date(props.data[0].date) : to_standard_date(props.data.date) }</td>
                        </tr>
                        <tr>
                            <th>Starting time</th>
                            <td>{ multiple_data ? props.data[0].start_time : props.data.start_time }</td>
                        </tr>
                        <tr>
                            <th>Ending time</th>
                            <td>{ multiple_data ? props.data[0].end_time : props.data.end_time }</td>
                        </tr>
                    </tbody>
                </table>

                <h6 className="mt-4 mb-3"><i className="fa fa-user"></i> Employee(s)</h6>
                <div className="list-group employee_list">
                    {
                        multiple_data ? 
                        props.data.map((single_shift, index) => {
                            return (
                                <EmployeeItem data={single_shift} key={`single_employee_${index}`} />
                            )
                        })
                        : 
                        <EmployeeItem data={props.data} />
                    }
                </div>
            </>
        )
    }

    const item_action = (shift_data) => {
        // window.location.href=`/shifts/${props.shift._id}`;
        ReactDOM.render(<ShiftModalContent data={shift_data} />, document.getElementById("edit_shift_modal_content"))
        open_custom_modal("edit_shift_modal")
    }

    return (
        <div 
            className={`shift_item ${multiple_users ? 'shift_item_multiple' : ''} rounded border`}
            style={{ "top": properties.top, "height": properties.height }}
            onClick={() => { item_action(props.shift) }}
        >
            {
                multiple_users ? 
                properties.colors.map((color, index) => {
                    return (<i className={`fa fa-user text-${color}`} key={`item_color_${index}`}></i>)
                })
                : <i className={`fa fa-user text-${properties.colors[0]}`}></i>
            }
        </div>
    );
}

export default ShiftItem