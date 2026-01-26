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
      .then(() => {
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
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}