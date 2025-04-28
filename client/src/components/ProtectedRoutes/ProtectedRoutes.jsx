// src/components/ProtectedRoutes/ProtectedRoutes.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, replace } from 'react-router-dom';
import { chatSelectors, deselectChat } from '../../redux/slices/chatSlice';

const ProtectedRoutes = ({ children }) => {
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
  const { isLoggedIn, loading } = useSelector((state) => state.auth || {});
  // // console.log(isLoggedIn);
  const location = useLocation();

  if (!isLoggedIn && !loading) {
    // Optionally pass redirect location in state
    // return <Navigate to="/user/login" state={{ from: location }} replace />;
    navigate('/user/login', {state:{from:location}}, replace);
  }
  const selectedChatID = useSelector(state => state.chats.selectedChatID);

  useEffect(()=>{
    if (selectedChatID) {
      
      dispatch(deselectChat({}));
    }
  }, [navigate]);

  return children;
};

export default ProtectedRoutes;
