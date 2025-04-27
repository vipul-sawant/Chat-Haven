import { useNavigate } from "react-router-dom";
// import UserForm from "../../components/User/UserForm.component.jsx";
import { fields } from "../../utils/form/fields/contacts/addUpdateContact.js";
import { Button } from "react-bootstrap";
import ContactForm from "../../components/Contacts/ContactForm.component.jsx";

// const UserLogin = () => {
//     const navigate = useNavigate();
//     return (
//         <>
//             <div  className="input-form-container">
//                 <h1> User Login </h1>
//                 <UserForm fieldsArray={fields} operation={'login'} page={'login'} />
//                 <Button className="my-btn btn-back" onClick={() => navigate('/user/register')}> Register </Button>
//             </div>
//         </>
//     )
// }

// export default UserLogin;import React from 'react'

const AddContact = () => {
    const navigate = useNavigate();
    return (
        <>
            <div  className="input-form-container">
                <h1> Add Contact </h1>
                <ContactForm fieldsArray={fields} operation={'add'} page={'add-contact'} />
                <Button className="my-btn btn-back" onClick={() => navigate('/contacts')}> Back </Button>
            </div>
        </>
    )
}

export default AddContact