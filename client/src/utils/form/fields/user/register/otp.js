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
        name:"otp",
        display:true,
        default: "",
        type:"text",
        label:"OTP",
        placeholder:"Enter Otp",
        validation: Yup.string().required()
    }
];