import React from 'react';

import './NavIcon.css';

const NavIcon = props => {
  return (
    <div className={`nav_icon_btn ${props.className}`} style={props.style}>
        <p className="nav_icon_img">{props.icon}</p>
        <div className="nav_icon_text">{props.text}</div>
    </div>
  );
};

export default NavIcon;