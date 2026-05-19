import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

export default RootRedirect;
