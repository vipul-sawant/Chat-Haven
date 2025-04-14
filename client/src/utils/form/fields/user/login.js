import * as Yup from 'yup';

export const fields = [
    {
        name: "email",
        display:true,
        default:'',
        type: "email",
        label: "E-Mail",
        placeholder: "Enter your E-mail", 
        validation: Yup.string().email("Enter Proper E-mail Format!")
        .required()
    },
    {
        name: "password",
        display:true,
        default:'',
        type: "password",
        label: "Password",
        placeholder: "Enter your Password",
        validation: Yup.string()
        .required()
    }
];