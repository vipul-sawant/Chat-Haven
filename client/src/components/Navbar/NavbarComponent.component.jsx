// import React from 'react'
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice.js";

const NavbarComponent = () => {
    
    const { error: authError, user } = useSelector((state) => state.auth || {});
    const dispatch = useDispatch();
    const handleLogout = async () => {
    const userAction = await dispatch(logoutUser());
    if (!userAction?.error) {
      alert("Logged out");
    }
  };

  return (
    
<Navbar bg="light" expand="lg" className="shadow-sm border-bottom">
  <Container fluid className="px-3">
  <Navbar.Brand as={Link}  to="/dashboard" className="fw-semibold">
  Chat Haven
</Navbar.Brand>

    <Nav className="ms-auto d-flex align-items-center gap-3">
      <Navbar.Text> 👤 Logged in as: {user?.email} </Navbar.Text>
      <Link to="/contacts" className="nav-link">Contact List</Link>
      <Button variant="outline-danger" size="sm" onClick={handleLogout}>
        Logout
      </Button>
    </Nav>
  </Container>
</Navbar>
  )
}

export default NavbarComponent