import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import './UserItem.css';

const UserItem = props => {
    return (
        <li className="userItem">
            <Card className="userContent">
                <Link to={`/users/${props.id}`}>
                    <div className="userImage">
                        <Avatar image={props.image} alt={props.name} />
                    </div>
                    <div className="userInfo">
                        <p className="userInfoName">{props.name}</p>
                        <div className="userPlace">
                            <p>{props.role}</p>
                            <p><i className="fas fa-paint-brush" style={{color:`${props.color}`}}></i><span className="badge badge-pill" style={{background:`${props.color}`}}>
                                &nbsp; &nbsp; &nbsp;</span>
                            </p>
                        </div>
                        
                    </div>
                </Link>
            </Card>
        </li>
    )
};

export default UserItem;