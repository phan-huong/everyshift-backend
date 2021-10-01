import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about_page">
            <div className="about_wrapper">
                <div className="title_section">About the app</div>

                <div className="main_content">
                    <div className="logo">
                        <img className="icon" src={`${process.env.PUBLIC_URL}/icons/logos/180x180.png`} />
                        <span className="version text-secondary">Version 1.0</span>
                    </div>
                    
                    <div className="intro_text">
                        <span className="text-info">EveryShift is one of the most epic and powerful tool for managment of working staffs and their daily shifts.</span>
                    </div>
                    
                    <div className="author_info">
                        <p>Author: Ngoc Huong Phan</p>
                        <button className="btn formBtn" onClick={() => { window.location.href="https://phanhuong.com" }}>Visit author's homepage</button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default About;