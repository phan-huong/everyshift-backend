import React from 'react';

import './MainFooter.css';

const MainFooter = props => {
    return <footer className="mainFooter">{props.children}</footer>
};

export default MainFooter;