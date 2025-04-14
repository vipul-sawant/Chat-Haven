import * as Yup from 'yup';

export const fields = [
    {
        name: "email",
        display:false,
        default:'',
        type: "email",
        label: "",
        placeholder: "",
        validation: Yup.string().email()
        .required()
    },
    {
        name: "fullName",
        display:true,
        default:'',
        type: "text",
        label: "Full Name",
        placeholder: "Enter your Full Name",
        validation: Yup.string()
        .required()
    },
    {
        name: "password",
        display:true,
        default:'',
        type: "password",
        label: "Password",
        placeholder: "Create a Strong Pasword",
        validation: Yup.string()
        .required()
    },
    {
        name: "c_password",
        display:true,
        default:'',
        type: "password",
        label: "Confirm Password",
        placeholder: "Enter Above Password",
        validation: Yup.string().when('password', {
            is: (password) => Boolean(password),
            then:(schema)=>schema.oneOf([Yup.ref('password'), null], 'Confirm Password is In-correct!').required()
        })
    }
];