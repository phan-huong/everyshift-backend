import React from 'react';

import './MainHeader.css';

const MainHeader = props => {
    return <div className="mainHeader">{props.children}</div>
};

export default MainHeader;