import * as Yup from 'yup';

export const fields = [
    {
        name: "text",
        display:true,
        default:'',
        type: "text",
        label: "",
        placeholder: "Write a message",
        validation: Yup.string()
        .required()
    },
    {
        name: "chatKey",
        display: false,
        default: "",
        type: "text",
        label: "",
        placeholder:"",
        validation: Yup.string()
    },
    // {
    //     name: "chatID",
    //     display: false,
    //     default: "",
    //     type: "text",
    //     label: "",
    //     placeholder:"",
    //     validation: Yup.string()
    // },
    {
        name: "contactID",
        display: false,
        default: "",
        type: "text",
        label: "",
        placeholder:"",
        validation: Yup.string()
    }
];