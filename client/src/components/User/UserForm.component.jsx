import { useState, useEffect } from "react";
import { replace, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";

import buildSchema from "../../utils/yup/buildSchema.js";
import { loginUser, registerUser } from "../../redux/slices/authSlice.js";

import socket from "../../utils/socket/socket.js";
import { connectSocket } from "../../utils/socket/connectSocket.js";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import createClient from "../../utils/axios/create.js";
import { fetchAllContacts } from "../../redux/slices/contactSlice.js";
import { fetchAllChats } from "../../redux/slices/chatSlice.js";
import { fetchAllMessages } from "../../redux/slices/messageSlice.js";

const UserForm = ({ fieldsArray, operation, data = {}, page }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formFields] = useState(fieldsArray);
  const schema = buildSchema(formFields, page);

  const { isLoggedIn = false, user = {}, error: authError = null, accessToken = false } =
    useSelector((state) => state?.auth || {});

  const defaultValues = formFields.reduce((acc, field) => {
    acc[field.name] = data[field.name] ?? field.default;
    return acc;
  }, {});

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const [redirect, setRedirect] = useState(false);

  const formSubmit = async (formData) => {
    try {
      if (operation === "register") {
        await createClient.post('/auth/register/request-otp', formData);
        navigate('/user/verify-otp', { state: { email: formData.email } });
        return;
      }

      if (operation === "verify-otp") {
        await createClient.post('/auth/register/verify-otp', formData);
        navigate('/user/register', { state: { email: formData.email } });
        return;
      }

      if (operation === "create-account") {
        await dispatch(registerUser(formData));
        setRedirect(true);
        return;
      }

      if (operation === "login") {
        const userAction = await dispatch(loginUser(formData));
        setRedirect(true);

        if (userAction?.error) {
          alert(userAction.payload);
        } else {
          await dispatch(fetchAllContacts());
          await dispatch(fetchAllChats());
          await dispatch(fetchAllMessages());
        }

        reset(); // ✅ Only reset for login
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const formErrors = (errors) => {
    console.error("Form validation errors:", errors);
  };

  useEffect(() => {
    let cleanup;

    if (isLoggedIn && redirect && accessToken && operation === "login") {
      cleanup = connectSocket(accessToken, dispatch);
      socket.emit("joinChat", { userID: user._id });
      // navigate(`/users/${user.email}/dashboard`, replace);
      navigate(`/dashboard`, replace);
    } else if (!isLoggedIn && redirect && operation === "create-account") {
      navigate("/user/login", replace);
    }

    return () => cleanup?.();
  }, [isLoggedIn, redirect, accessToken, operation, user?._id, user?.email]);

  return (
    <Form onSubmit={handleSubmit(formSubmit, formErrors)} noValidate>
      {formFields.map((field) =>
        field.display && (
          <Form.Group key={field.name} controlId={field.name} className="form-group-wrapper">
            <Row>
              <Col sm={12} className="col-wrapper">
                <Form.Label className="form-label">{field.label}</Form.Label>
              </Col>
              <Col sm={12}>
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: controllerField }) => (
                    <Form.Control
                      {...controllerField}
                      type={field.type}
                      placeholder={field.placeholder}
                      className="form-input"
                    />
                  )}
                />
              </Col>
            </Row>
          </Form.Group>
        )
      )}
      <Button type="submit" className="my-btn">
        {operation}
      </Button>
    </Form>
  );
};

export default UserForm;
