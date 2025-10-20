import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';

type Props = { children: JSX.Element };

export function RequireAuth({ children }: Props) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default RequireAuth;
