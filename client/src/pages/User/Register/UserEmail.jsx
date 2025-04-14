import { useNavigate } from "react-router-dom";
import UserForm from "../../../components/User/UserForm.component.jsx";
import { fields } from "../../../utils/form/fields/user/register/email.js";
import { Button } from "react-bootstrap";

const UserEmail = () => {
    
    const navigate = useNavigate();
    return (
        <>
            <div  className="input-form-container">
                <h1> User Register E-Mail </h1>
                <UserForm fieldsArray={fields} operation={'register'} page={'register'} />
                <Button className="my-btn btn-back" onClick={() => navigate(-1)}> Back </Button>
            </div>
        </>
    );
}

export default UserEmail