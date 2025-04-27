import { useState, useEffect } from "react";

// import { replace, useNavigate } from "react-router-dom";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useDispatch, useSelector } from "react-redux";

import buildSchema from "../../utils/yup/buildSchema.js";

import { sendMessage } from "../../redux/slices/messageSlice.js";
// import socket from "../../utils/socket/socket.js"

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from "react-bootstrap/Button";

const MessageForm = ({ fieldsArray, data={}, page="message" }) => {

	const [ formfields, setFormFields ] = useState(fieldsArray);
    const schema = buildSchema(formfields, page);const setDefaultValues = (fields, data) => {

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
		
    // const navigate = useNavigate();
    const dispatch = useDispatch();

	// const [ redirect, setRedirect ] = useState(false);

	const formSubmit = async (formData) => {
		try {
		  // console.log("🚀 Submitted form data:", formData); // 👈 Add this
	  
		  const messageAction = await dispatch(sendMessage(formData));
		  if (messageAction?.error) {
			alert(messageAction.payload);
		  }
	  
		  reset();
		} catch (error) {
		  console.error("Error sending message:", error);
		}
	  };
	  

	const formErrors = (errors, e) => {
		console.error("errors :", errors);
	}

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

				<Button type="submit" className="my-btn"> Send  </Button>
			</Form>
		</>
  )
}

export default MessageForm