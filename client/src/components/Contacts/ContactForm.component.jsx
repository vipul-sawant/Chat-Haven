// import React from 'react'
import { useState, useEffect } from "react";
import { replace, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
// import createClient from "../../utils/axios/create.js";
import buildSchema from "../../utils/yup/buildSchema.js";
import { addContact, editContact } from "../../redux/slices/contactSlice.js";

const ContactForm = ({ fieldsArray, operation, data = {}, page }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log("data from contactFOrm :", data);

  const [formFields, setFormFields] = useState(fieldsArray);
  const schema = buildSchema(formFields, page);
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

      let result;
      if (operation === "add") {
        result = await dispatch(addContact(formData));
        // setRedirect(true);
        // return;
      }

      if (operation === "edit") {
        result = await dispatch(editContact({id:data._id, updates:formData}));
        // setRedirect(true);

        // if (userAction?.error) {
        //   alert(userAction.payload);
        // } else {
        //   await dispatch(fetchAllContacts());
        //   await dispatch(fetchAllChats());
        //   await dispatch(fetchAllMessages());
        // }

      }

      if (result?.error) {
        
        alert(result.payload);
      } else {
        setRedirect(true);
        reset();
      }
      // reset(); // ✅ Only reset for login

    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const formErrors = (errors) => {
    console.error("Form validation errors:", errors);
  };

  useEffect(()=>{

    if (redirect) {
      
      navigate('/contacts', replace);
    }
  }, [redirect]);

  return (
    
		<>
			<Form onSubmit={handleSubmit(formSubmit, formErrors)} noValidate>
				{formFields.map(field=>(
				
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

				<Button type="submit" className="my-btn"> {operation} </Button>
			</Form>
		</>
  )
}

export default ContactForm;