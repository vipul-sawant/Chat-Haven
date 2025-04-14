import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import Container from 'react-bootstrap/Container';

import { Outlet, useNavigate, replace } from "react-router-dom";
import socket from './utils/socket/socket.js';
import { connectSocket } from './utils/socket/connectSocket.js';

const Layout = () => {
    const navigate = useNavigate();
    const { user = {}, isLoggedIn = false, accessToken } = useSelector(state=>state?.auth || {});

    useEffect(()=>{
        let cleanup;
        if (isLoggedIn) {
            
            console.log('isLoggedIn :', isLoggedIn);
            cleanup = connectSocket(accessToken);
            socket.emit('joinChat', { userID: user._id });
            navigate(`/users/${user.email}/dashboard`, replace);
        } else if (!isLoggedIn)  {
            navigate(`/user/login`, replace);
        }

        return () => {
            cleanup?.(); // ✅ cleanly disconnect if it was connected
          };
    }, [isLoggedIn]);
  
    return (
        <>
            <Container fluid>
                <Outlet />
            </Container>
        </>
    );
};

export default Layout;