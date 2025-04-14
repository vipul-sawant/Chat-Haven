import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import Layout from './Layout';
import UserRegister from './pages/User/Register/UserRegister.jsx';
import UserLogin from './pages/User/UserLogin.jsx';
import UserEmail from './pages/User/Register/UserEmail.jsx';
import Dashboard from './pages/User/Dashboard.jsx';
import ProtectedRoutes from './components/ProtectedRoutes/ProtectedRoutes.jsx';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import VerifyOtp from './pages/OTP/VerifyOtp.jsx';

const App = () => {

	const router = createBrowserRouter([{

		path: "/",
		element: <Layout />,
		children: [
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
				path: "users/:email/dashboard",
				element: <ProtectedRoutes> <Dashboard /> </ProtectedRoutes>
			}
		]
	}], { basename: "/chat-app" });

	// const notes = useSelector(state=>state?.notes);

	const auth = useSelector(state=>state.auth);
	const contacts = useSelector(state=>state.contacts);
	const chats = useSelector(state=>state.chats);
	const messages = useSelector(state => state.messages);

	useEffect(()=>{

		console.log("auth :", auth);
		console.log("contacts :", contacts);
		console.log("chats :", chats);
		console.log("messages :", messages);
	}, [auth, contacts, chats, messages.byChatId]);

	return (
		<>
			<RouterProvider router={router} />
		</>
	);
}

export default App
