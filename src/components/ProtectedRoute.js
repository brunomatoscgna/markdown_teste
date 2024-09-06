import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ token, children }) => {
  // Se não houver token, redirecionar para a página de login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Se o token existir, renderizar o componente filho
  return children;
};

export default ProtectedRoute;
