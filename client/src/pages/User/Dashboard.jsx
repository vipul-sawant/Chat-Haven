// src/pages/User/Dashboard.jsx
import { useEffect, useState } from "react";
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
import Offcanvas from "react-bootstrap/Offcanvas";
import "./Dashboard.css";

const Dashboard = () => {
  const [showContacts, setShowContacts] = useState(false);

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
      <Container fluid className="p-0 vh-100 d-flex flex-column">
      {/* Mobile header */}
      <div className="d-md-none p-2 bg-light border-bottom">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowContacts(true)}
        >
          ☰ Contacts
        </Button>
      </div>

      {/* Main layout */}
      <Row className="flex-fill g-0">
        {/* Offcanvas for mobile */}
        <Offcanvas
          show={showContacts}
          onHide={() => setShowContacts(false)}
          // responsive="md"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Contacts</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <ChatList />
          </Offcanvas.Body>
        </Offcanvas>

        {/* Sidebar on desktop */}
        <Col md={4} className="d-none d-md-block border-end p-0">
          <ChatList />
        </Col>

        {/* Chat area */}
        <Col xs={12} md={8} className="p-0 d-flex flex-column">
          <ChatWindow />
        </Col>
      </Row>
    </Container>
    </>
  );
};

export default Dashboard;
