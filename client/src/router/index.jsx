import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout.jsx";

import UserLogin from "../pages/User/UserLogin.jsx";
import UserEmail from "../pages/User/Register/UserEmail.jsx";
import VerifyOtp from "../pages/OTP/VerifyOtp.jsx";
import UserRegister from "../pages/User/Register/UserRegister.jsx";

import NavbarComponent from "../components/Navbar/NavbarComponent.component.jsx";

import Dashboard from "../pages/User/Dashboard.jsx";

import ProtectedRoutes from "../components/ProtectedRoutes/ProtectedRoutes.jsx";
import ContactList from "../components/Contacts/ContactList.component.jsx";
import ViewContact from "../components/Contacts/ViewContact.component.jsx";
import EditContact from "../pages/Contacts/EditContact.jsx";
import AddContact from "../pages/Contacts/AddContact.jsx";
// import AuthRedirect from "../components/ProtectedRoutes/AuthRedirect.jsx";

const router = createBrowserRouter([{

    path: "/",
    element: <Layout />,
    children: [
        // {
        //     index:true,
        //     element : <AuthRedirect />
        // },
        {
            path: "user/register",
            element: <UserEmail />
        },
        {
            path: "user/verify-otp",
            element: <VerifyOtp />
        },
        {
            path: "user/create-account",
            element: <UserRegister />
        },
        {
            path: "user/login",
            element: <UserLogin />
        },
        {
            path: "dashboard",
            element: <ProtectedRoutes> <NavbarComponent /> <Dashboard /> </ProtectedRoutes>
        },
        {
            path: "contacts",
            element: <ProtectedRoutes> <NavbarComponent /> <ContactList /> </ProtectedRoutes>
        },
        {
            path: "contacts/view/:id",
            element: <ProtectedRoutes> <NavbarComponent /> <ViewContact /> </ProtectedRoutes>
        },
        {
            path: "contacts/edit/:id",
            element: <ProtectedRoutes> <NavbarComponent /> <EditContact /> </ProtectedRoutes>
        },
        {
            path: "contacts/add",
            element: <ProtectedRoutes> <NavbarComponent /> <AddContact /> </ProtectedRoutes>
        }
    ]
}], { basename: "/chat-haven" });

export default router;