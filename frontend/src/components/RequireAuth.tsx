import { Navigate } from 'react-router';
import { useState, useEffect } from 'react';
import authService from '../services/authService';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = authService.getToken();

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    // Validate token with backend
    authService.validateToken(token)
      .then((response) => {
        // Store/refresh user data when token is validated
        localStorage.setItem('lifeflow-user', JSON.stringify({
          id: response.userId,
          email: response.email,
          name: response.name,
          firstName: response.name?.split(' ')[0] || response.name,
          role: response.role
        }));
        setIsAuthenticated(true);
      })
      .catch(() => {
        authService.removeToken();
        localStorage.removeItem('lifeflow-user');
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}