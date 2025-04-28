import { replace, useNavigate, useParams } from "react-router-dom";
import { fields } from "../../utils/form/fields/contacts/addUpdateContact.js";
import { Button } from "react-bootstrap";
import ContactForm from "../../components/Contacts/ContactForm.component.jsx";
import { fetchContactById } from "../../redux/slices/contactSlice";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const EditContact = () => {
    const navigate = useNavigate();
    const {id = null} = useParams();
    
    const contact = useSelector(state => id ? fetchContactById(state, id) : {});

    const [contactData, setContactData] = useState(null);
    // let contactData = {};
    useEffect(()=>{

        if (!id) {
            
            navigate('/contacts', replace);
        }
        if (contact) {
            // contactData = {};
            // contactData.contactName = contact.contactName;
            // contactData.email = contact.savedUser.email;
            setContactData({contactName: contact.contactName, email: contact.savedUser.email, _id:contact._id});
        }

        // console.log("contactData :", contactData);
    }, [id,contact]);

    if (!contactData) {
        
        return;
    }
   return (
          <>
              <div  className="input-form-container">
                  <h1> Edit Contact </h1>
                  <ContactForm fieldsArray={fields} operation={'edit'} data={contactData} page={'edit-contact'} />
                  <Button className="my-btn btn-back" onClick={() => navigate('/contacts')}> Back </Button>
              </div>
          </>
      )
}

export default EditContact;