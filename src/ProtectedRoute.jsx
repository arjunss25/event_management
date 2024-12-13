import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role, loading } = useSelector((state) => state.auth);

  // Show a loading state if auth data is still being fetched
  if (loading) {
    return <div className="w-full h-48 flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
  </div> 
  }

  // Redirect to login if not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to the user's dashboard if role does not match allowedRoles
  if (!allowedRoles.includes(role)) {
    // Redirect based on the user's role
    switch (role) {
      case 'Superadmin':
        return <Navigate to="/" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'employee':
        return <Navigate to="/employee/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Render the protected content if authenticated and role is allowed
  return children;
};

export default ProtectedRoute;
