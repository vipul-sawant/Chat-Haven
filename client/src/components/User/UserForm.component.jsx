import { useState, useEffect, useMemo } from "react";

import { replace, useNavigate } from "react-router-dom";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useDispatch, useSelector } from "react-redux";

import buildSchema from "../../utils/yup/buildSchema.js";

import { loginUser, registerUser } from "../../redux/slices/authSlice.js";
// import { fetchNotes } from "../../redux/slices/notesSlice.js";

import socket from "../../utils/socket/socket.js"
import { connectSocket } from "../../utils/socket/connectSocket.js";

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from "react-bootstrap/Button";
import createClient from "../../utils/axios/create.js";
import { fetchAllContacts } from "../../redux/slices/contactSlice.js";
import { fetchAllChats } from "../../redux/slices/chatSlice.js";
import { fetchMessages } from "../../redux/slices/messageSlice.js";

const UserForm = ({ fieldsArray, operation, data={}, page,  }) => {

	const [ formfields, setFormFields ] = useState(fieldsArray);
    const schema = buildSchema(formfields, page);

    const { isLoggedIn = false, user={}, error:authError = null, accessToken = false } = useSelector(state=>state?.auth || {});
    
	const setDefaultValues = (fields, data) => {

        const reducedObj = fields.reduce((acc, field)=>{

			const fieldName = field.name;
            acc[fieldName] = data[fieldName] ? data[fieldName] : field.default;
            return acc;

        }, {});

        return reducedObj;
    };

    const [ fieldsDefaults, setFieldDefaults ] = useState(setDefaultValues(formfields, data));

	const { control ,handleSubmit, formState:{errors}, reset } = useForm(
        {
            resolver:yupResolver(schema),
            defaultValues:fieldsDefaults
        });
		
    const navigate = useNavigate();
    const dispatch = useDispatch();

	const [ redirect, setRedirect ] = useState(false);

	const formSubmit = async (data, e) => {

		console.log('form data :', data);

		try {
			let userAction;
			if (operation === "register") {
				
				userAction = await createClient.post('/auth/register/request-otp', data).then((data)=>{

					navigate('/user/verify-otp', {state:data});
				});
			} else if (operation === "verify-otp") {
				
				
				userAction = await createClient.post('/auth/register/verify-otp', data).then((data)=>{

					navigate('/user/verify-otp', {state:data});
				});
			} else if (operation === "create-account") {
				
				userAction = await dispatch(registerUser(data));
				setRedirect(true);
			} else if (operation === "login") {
				
				userAction = await dispatch(loginUser(data));
				// console.log("login userAction :", userAction);
				// socket.
				setRedirect(true);

				// ✅ If user exists, fetch chats & contacts
				if (userAction?.error) {

					alert(userAction.payload);
				} else {

					// const notesAction = await dispatch(fetchNotes());

					// if (notesAction?.error) {
						
					// 	alert(notesAction.payload);
					// }
					await dispatch(fetchAllContacts());
					await dispatch(fetchAllChats());
					await dispatch(fetchMessages());
				}
			}
			
		} catch (error) {
			
			console.log('Error :', error);
			// alert(error?.response?.data?.message)
		}
	};

	const formErrors = (errors, e) => {
		console.error("errors :", errors);
	}

	useEffect(() => {
		let cleanup;
	  
		if (isLoggedIn && redirect && accessToken && operation === "login") {
		  cleanup = connectSocket(accessToken);
		  socket.emit('joinChat', { userID: user._id });
		  navigate(`/users/${user.email}/dashboard`, replace);
		} else if (!isLoggedIn && redirect && operation === "create-account") {
		  navigate("/user/login", replace);
		}
	  
		return () => {
		  cleanup?.(); // ✅ cleanly disconnect if it was connected
		};
	  }, [isLoggedIn, redirect, accessToken, operation, user?._id, user?.email]);
	  
	useEffect(()=>{

		console.log("auth error :", authError);
	}, [authError]);

	return (
		<>
			<Form onSubmit={handleSubmit(formSubmit, formErrors)} noValidate>
					{formfields.map(field=>(
						
						field.display && <Form.Group key={field.name} controlId={field.name}  className="form-group-wrapper">
							<Row>	
								<Col sm={12} className="col-wrapper">
									<Form.Label className="form-label"> {field.label} </Form.Label>
								</Col>

								<Col sm={12}>
									<Controller name={field.name}
											control={control}
											render={
												({field:controllerField})=>(
													<Form.Control {...controllerField}
														type={field.type}
														placeholder={field.placeholder}
														className="form-input">
													</Form.Control>)
										}></Controller>
								</Col>									
							</Row>	
						</Form.Group>
					))}

					<Button type="submit" className="my-btn">{ operation } </Button>
				</Form>
			</>
	)
}

export default UserForm;