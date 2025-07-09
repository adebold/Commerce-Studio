import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // For now, we'll assume the user is authenticated.
  // In a real application, this would check for a valid JWT or session.
  const isAuth = isAuthenticated || true; 

  return isAuth ? children : <Navigate to="/login" />;
};

export default PrivateRoute;