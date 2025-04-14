import * as Yup from 'yup';

export const fields = [
    {
        name: "email",
        display:true,
        default:'',
        type: "email",
        label: "E-Mail",
        placeholder: "Enter Your E-Mail",
        validation: Yup.string()
        .email()
        .required()
    }
];