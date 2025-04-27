// src/components/ProtectedRoutes/ProtectedRoutes.jsx
import { useSelector } from 'react-redux';
import { useNavigate, useLocation, replace } from 'react-router-dom';

const ProtectedRoutes = ({ children }) => {
    const navigate = useNavigate();
  const { isLoggedIn, loading } = useSelector((state) => state.auth || {});
  // console.log(isLoggedIn);
  const location = useLocation();

  if (!isLoggedIn && !loading) {
    // Optionally pass redirect location in state
    // return <Navigate to="/user/login" state={{ from: location }} replace />;
    navigate('/user/login', {state:{from:location}}, replace);
  }

  return children;
};

export default ProtectedRoutes;
