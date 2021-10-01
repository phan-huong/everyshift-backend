import React from 'react';
import './UserList.css';
import UserItem from './UserItem';
import Card from '../../shared/components/UIElements/Card';

const UsersList = props => {
    // console.log(props.items);
    if (props.items.length === 0)
        return (
            <Card>
                <h2>No users found!</h2>
            </Card>
        );
    
    return <ul className="usersList">
        {props.items.map(user => {
            let current_user_id = JSON.parse(localStorage.getItem("userData"))._id;
            if (current_user_id !== user._id)
                return (
                    <UserItem 
                        key={user._id}
                        id={user._id} 
                        image={user.image} 
                        name={user.name || `${user.firstName} ${user.lastName}`} 
                        role={user.role}
                        color={user.color_bkgr}
                    />
                )
        })}
    </ul>
};

export default UsersList;