import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import Container from 'react-bootstrap/Container';

import { Outlet, useNavigate, replace, useLocation } from "react-router-dom";
import socket from './utils/socket/socket.js';
import { connectSocket } from './utils/socket/connectSocket.js';
import { chatSelectors } from './redux/slices/chatSlice.js';
import { messageSelectors } from './redux/slices/messageSlice.js';
import { contactSelectors } from './redux/slices/contactSlice.js';

const Layout = () => {
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const { user = {}, isLoggedIn = false, accessToken } = useSelector(state=>state?.auth || {});
    const chats = useSelector(chatSelectors.selectAll);
    const messages = useSelector(messageSelectors.selectAll);
    const contacts = useSelector(contactSelectors.selectAll);

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
    }, [isLoggedIn, navigate, pathname]);

    useEffect(()=>{

        // console.log("chats :", chats);
        // console.log("messages :", messages);
        // console.log("contacts :", contacts);
    }, [chats, messages, contacts]);

    return (
        <>
            <Container fluid>
                <Outlet />
            </Container>
        </>
    );
};

export default Layout;