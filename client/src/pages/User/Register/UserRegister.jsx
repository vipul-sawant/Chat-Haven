import { Link, useLocation, useNavigate } from "react-router-dom";
import UserForm from "../../../components/User/UserForm.component.jsx";
import { fields} from "../../../utils/form/fields/user/register/finalFields.js";
import { Button } from "react-bootstrap";

const UserRegister = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { email } = state || {};
    return (
        <>
            <div  className="input-form-container">
                <h1> User Register</h1>
                <UserForm fieldsArray={fields} operation='create-account' data={{email}} page='create-account' />
                <Button className="my-btn btn-back" onClick={() => navigate('/user/login')}> Login </Button>
            </div>
        </>
    )
}

export default UserRegister;