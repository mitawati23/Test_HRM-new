import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!savedToken || !savedUser) {
      return;
    }

    const bootstrap = async () => {
      try {
        const res = await authService.me();
        const profile = res.data?.data;
        if (!profile?.id) {
          throw new Error('Invalid session');
        }
        const sessionUser = {
          id: profile.id,
          name: profile.name ?? JSON.parse(savedUser).name,
          email: profile.email,
          role: profile.role,
        };
        setToken(savedToken);
        setUser(sessionUser);
        localStorage.setItem('user', JSON.stringify(sessionUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
      }
    };

    bootstrap();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      const payload = response.data?.data;

      if (!payload?.accessToken || !payload?.user) {
        throw new Error('Invalid response from server');
      }

      setUser(payload.user);
      setToken(payload.accessToken);

      localStorage.setItem('token', payload.accessToken);
      localStorage.setItem('user', JSON.stringify(payload.user));
      return payload.user;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Backend tidak terjangkau. Jalankan: cd backend && npm run dev'
          : err.message) ||
        'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!token && !!user,
        token,
        login,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
