import React from "react";

const HourLine = ({ item_height }) => {
    const set_hour_line_postitions = () => {
        let output = [];

        let top_position = 0;
        for (let i = 0; i < 24; i++) {
            output.push(top_position);
            top_position += item_height;
        }

        return output;
    }
    const hour_line_positions = set_hour_line_postitions();

    return (
        <>
            {
                hour_line_positions.map((top_pos, index) => {
                    if (top_pos === 0) return <React.Fragment key={`hour_line_${index}`}></React.Fragment>
                    return (
                        <div className="hour_line" style={{ "top": `${top_pos}px` }} key={`hour_line_${index}`}></div>
                    )
                })
            }
        </>   
    )
}

export default HourLine;