import { useLocation, useNavigate } from "react-router-dom";
import UserForm from "../../components/User/UserForm.component.jsx";
import { fields } from "../../utils/form/fields/user/register/otp.js";
import { Button } from "react-bootstrap";

const VerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location?.state;
    return (
        <>
            <div  className="input-form-container">
                <h1> Verify OTP </h1>
                <UserForm fieldsArray={fields} operation={'verify-otp'} data={locationState} page={'verify-otp'} />
                <Button className="my-btn btn-back" onClick={() => navigate(-1)}> Back </Button>
            </div>
        </>
    );
}

export default VerifyOtp