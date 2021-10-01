import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import DateToday from '../../functions/Date';
import MainHeader from './MainHeader';
import SideDrawer from './SideDrawer';
import './NavBar.css';

const NavHeader = props => {
    const [username, setUsername] = useState("Username");
    const [drawerVisible, setdrawerVisible] = useState(false);
    var sideDrawerOpenClass = "drawerOpen";
    var rotateClass = "navbar_rotate";

    const openDrawer = (event) => {
        event.preventDefault();
        setdrawerVisible(!drawerVisible);
    }

    useEffect(() => {
        window.addEventListener('mouseup',function(event){
            var sideDrawer = document.getElementById('sideDrawer');
            var navBtn = document.getElementById("userNavBtn");
            var navBtn_i = document.getElementById("userNavBtn_i");
            if (sideDrawer && event.target !== sideDrawer && event.target.parentNode !== sideDrawer
                && event.target !== navBtn && event.target !== navBtn_i){
                setdrawerVisible(false);
            }
        });

        if (localStorage.getItem("userData")) {
            let userData = JSON.parse(localStorage.getItem("userData"));
            setUsername(userData.name ? userData.name : `${userData.firstName} ${userData.lastName}`);
        }
    }, [])
    
    return (
        <header>
            <MainHeader>
                <div className="headerUserContainer">
                    <Link id="userNavBtn" className="userNavBtn" onClick={(e) => openDrawer(e)} to="#">
                        <i id="userNavBtn_i" className={`fa fa-bars navbar_icon ${ drawerVisible ? rotateClass : '' }`} aria-hidden="true"></i>
                    </Link>
                    <span className="headerUsername">{username}</span>
                </div>
                <DateToday />
            </MainHeader>
            <SideDrawer visible={drawerVisible} visible_class={sideDrawerOpenClass} />
        </header>
    )
};

export default NavHeader;