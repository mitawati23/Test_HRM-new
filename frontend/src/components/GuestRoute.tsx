// Halaman publik (login): redirect ke home jika sudah punya sesi
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/dashboard' : '/'}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default GuestRoute;
