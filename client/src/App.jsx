// src/App.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeUser } from './redux/slices/authSlice.js';
import { fetchAllChats } from './redux/slices/chatSlice.js';
import { fetchAllMessages } from './redux/slices/messageSlice.js';
import { fetchAllContacts } from './redux/slices/contactSlice.js';

const App = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, accessToken } = useSelector((state) => state.auth || {});

  useEffect(() => {
    // Step 1: Always try to initialize the user on app load
	// console.log("app");
    dispatch(initializeUser());
  }, [dispatch]);

  useEffect(() => {
    // Step 2: Once logged in, fetch all needed data
    if (isLoggedIn && accessToken) {
      dispatch(fetchAllChats());
      dispatch(fetchAllMessages());
      dispatch(fetchAllContacts());
    }
  }, [isLoggedIn, accessToken, dispatch]);

  // No JSX because routing is handled via <RouterProvider />
  return null;
};

export default App;
