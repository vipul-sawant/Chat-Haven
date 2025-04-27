// src/pages/User/Dashboard.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";

// import { logoutUser } from "../../redux/slices/authSlice";
import socket from "../../utils/socket/socket";
import setupMessageListeners from "../../utils/socket/messageStatus";

import ChatWindow from "../../components/Chat/ChatWindow.component";
import ChatList from "../../components/Chat/ChatList.component";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import "./Dashboard.css";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { error: authError, isLoggedIn = false } = useSelector((state) => state.auth || {});
  // const { email = "unknown" } = useParams();

  // const handleLogout = async () => {
  //   const userAction = await dispatch(logoutUser());
  //   if (!userAction?.error) {
  //     alert("Logged out");
  //   }
  // };

  useEffect(() => {
    if (authError) {
      console.error("Auth Error:", authError);
    }
  }, [authError]);

  useEffect(() => {
    if (!isLoggedIn) {
      socket.disconnect();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (socket.active) {
      setupMessageListeners(socket, dispatch);
    }
  }, [socket]);

  return (
    <>
      {/* 🔷 TOP BAR */}
      {/* <div className="dashboard-topbar d-flex justify-content-between align-items-center p-2 px-3 border-bottom shadow-sm">
        <span className="fw-semibold">👤 Logged in as: {email}</span>
        <Link to={'/contacts'} style={{textDecoration:"none"}}> Contact List </Link>
        <Button variant="outline-danger" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div> */}

      {/* 🔷 CHAT LAYOUT */}
      <Container fluid>
        <Row className="vh-100">
          <Col xs={12} md={4} className="border-end p-0">
            <ChatList />
          </Col>
          <Col xs={12} md={8} className="p-0">
            <ChatWindow />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;
