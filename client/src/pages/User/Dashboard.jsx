import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice.js";

import "./Dashboard.css";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import socket from "../../utils/socket/socket.js";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import ChatWindow from "../../components/Chat/ChatWindow.component.jsx";
import ChatList from "../../components/Chat/ChatList.component.jsx";
import setupMessageListeners from "../../utils/socket/messageStatus.js";

const Dashboard = () => {
    
    const dispatch = useDispatch();
    const { error:authError, isLoggedIn=false } = useSelector(state=>state?.auth || {});
    const handleLogout = async () => {

        const userAction = await dispatch(logoutUser());

        const errors = Object.keys(userAction?.error || {});

        if (errors?.length === 0) {
            
            alert("logged out");
        }
    };

    useEffect(()=>{

        console.log("auth Error :", authError);
    }, [authError]);

    useEffect(()=>{
        if (!isLoggedIn) {
        
            socket.disconnect();    
        }
    }, [isLoggedIn]);

    const { email="nothing" } = useParams();

    useEffect(()=>{

        if (socket.connected) {
            
            // dispatch(setupMessageListeners(socket, dispatch));
            setupMessageListeners(socket, dispatch);
        }
    }, [socket.connected]);

    return (
        <>
            <div className="dashboard-container">
                {/* <NotesList /> */}
                <h1>Dashboard</h1>
                <br></br>
                <p>{email}</p>
                <br></br>
                <button className="btn btn-danger" onClick={()=>{handleLogout()}}>Logout</button>
            </div>

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

export default Dashboard