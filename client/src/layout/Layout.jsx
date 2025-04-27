// src/layout/Layout.jsx
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Container from 'react-bootstrap/Container';

import socket from '../utils/socket/socket.js'; // updated import path to be relative to /layout
import { connectSocket } from '../utils/socket/connectSocket.js';

const Layout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoggedIn, accessToken, loading } = useSelector((state) => state?.auth || {});

  useEffect(() => {
    console.log("layout loaded");
    let cleanup;

    if (isLoggedIn && accessToken && user?._id && !loading) {
      // console.log('User is logged in, initializing socket and navigating to dashboard...');

      cleanup = connectSocket(accessToken, dispatch);
      socket.emit('joinChat', { userID: user._id });

      // Navigate only if not already on the dashboard (optional enhancement)
      // const userDashboard = `/users/${user.email}/dashboard`;
      const userDashboard = `/dashboard`;
      if (window.location.pathname !== userDashboard) {
        // console.log(window.location.pathname);
        navigate(userDashboard, { replace: true });
      }

    } else if (!isLoggedIn && !loading) {
      navigate('/user/login', { replace: true });
    }

    return () => {
      cleanup?.(); // Disconnect socket on unmount or dependency change
    };
  }, [isLoggedIn, accessToken, user?._id, user?.email, navigate]);

  return (
    <Container fluid>
      <Outlet />
    </Container>
  );
};

export default Layout;
