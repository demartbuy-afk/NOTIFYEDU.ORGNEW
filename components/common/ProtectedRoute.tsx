import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserType } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredUserType: UserType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredUserType }) => {
  const { user } = useAuth();

  if (!user || user.type !== requiredUserType) {
    // If a user is not logged in, or is the wrong type, redirect them.
    // For the admin route, we want to show the admin login view specifically.
    const redirectTo = requiredUserType === UserType.SuperAdmin ? '/login?for=admin' : '/login';
    return <Navigate to={redirectTo} />;
  }

  return children;
};

export default ProtectedRoute;
