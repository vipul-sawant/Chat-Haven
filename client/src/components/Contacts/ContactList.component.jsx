// src/pages/Contacts/ContactList.jsx
// import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { fetchContacts } from "../../redux/slices/contactSlice.js";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, ListGroup } from "react-bootstrap";
import { contactSelectors, deleteContact as removeContact } from "../../redux/slices/contactSlice.js";

const ContactList = () => {
  const dispatch = useDispatch();
//   const { contacts = [] } = useSelector((state) => state.contacts);

//   useEffect(() => {
    // dispatch(fetchContacts());
//   }, [dispatch]);

  const contacts = useSelector(contactSelectors.selectAll);
  console.log('contacts :', contacts);

  const deleteContact = async (id) => {

    const isConfirmed = confirm("Are you sure you want to delete this contact?");
    if (isConfirmed) {
      
      const deleted = await dispatch(removeContact(id));

      if (deleted?.error) {
        
        alert(deleted.payload);
      }
    }
  };
  return (
    <Container className="py-4">
      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📇 Your Contacts</h5>
              <Link to="/contacts/add">
                <Button variant="primary" size="sm">+ Add Contact</Button>
              </Link>
            </Card.Header>
            
              {contacts.length > 0 && contacts.map((contact) => (
                <ListGroup variant="flush" key={contact._id}>
                <ListGroup.Item key={contact._id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{contact.contactName}</strong><br />
                    <small>{contact.savedUser.email}</small>
                  </div>
                  <div>
                    <Link to={`/contacts/view/${contact._id}`} className="btn btn-info btn-sm me-2">View</Link>
                    <Link to={`/contacts/edit/${contact._id}`} className="btn btn-warning btn-sm">Edit</Link>
                    {/* <Link to={`/contacts/delete/${contact._id}`} className="btn btn-warning btn-sm">Delete</Link> */}
                    <Button className="btn-danger" onClick={()=>{deleteContact(contact._id)}}> Delete </Button>
                  </div>
                </ListGroup.Item>
            </ListGroup>
              ))}
            {contacts.length === 0 && <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📇 No Contacts Saved </h5>
            </Card.Header>}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactList;