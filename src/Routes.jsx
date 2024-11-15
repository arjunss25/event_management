import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Import all components
import SuperadminLayout from './layouts/SuperadminLayout';
import EventgroupsSuperadmin from './pages/Superadmin/EventgroupsSuperadmin';
import SuperadminDashboard from './Dashboards/SuperadminDashboard';
import EventsSuperadmin from './pages/Superadmin/EventsSuperadmin';
import ExpiredeventsSuperadmin from './pages/Superadmin/ExpiredeventsSuperadmin';
import PaymenthistorySuperadmin from './pages/Superadmin/PaymenthistorySuperadmin';
import AdminDashboard from './Dashboards/AdminDashboard';
import AdminLayout from './layouts/AdminLayout';
import AdminEvents from './pages/Admin/AdminEvents';
import AdminEventDetails from './pages/Admin/AdminEventDetails';
import Login from './Components/Login';
import MealScanner from './pages/Employee/MealScanner';
import EmployeeLayout from './layouts/EmployeeLayout';
import EmployeeDetails from './pages/Admin/EmployeeDetails';
import AddCategory from './pages/Admin/AddCategory';
import Userprofile from './pages/User/Userprofile';
import RegisteredUserTable from './Components/Admin/RegisteredUserTable';
import EventgroupProfile from './pages/Superadmin/EventgroupProfile';

const ProtectedRoute = ({ children, requiredRole }) => {
  const auth = useSelector((state) => state.auth);
  
  // Normalize roles to lowercase
  const userRole = auth.user?.role?.trim().toLowerCase();
  const expectedRole = requiredRole?.trim().toLowerCase();

  // Check if the token exists
  if (!auth.token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Role mismatch handling
  if (expectedRole && userRole !== expectedRole) {
    console.log('Role mismatch, redirecting to appropriate dashboard');
    switch (userRole) {
      case 'superadmin':
        return <Navigate to="/superadmin/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'employee':
        return <Navigate to="/employee/scanner" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  console.log('Access granted to protected route');
  return children;
};

const AppRoutes = () => {
  const auth = useSelector((state) => state.auth);
  
  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/login" 
        element={
          auth.token ? (
            <Navigate to={`/${auth.user?.role?.toLowerCase()}/dashboard`} replace />
          ) : (
            <Login />
          )
        } 
      />

      {/* Superadmin Routes */}
      <Route
        path="/superadmin"
        element={
          auth.token && auth.user?.role.toLowerCase() === 'superadmin' ? (
            <SuperadminLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperadminDashboard />} />
        <Route path="eventgroups" element={<EventgroupsSuperadmin />} />
        <Route path="events" element={<EventsSuperadmin />} />
        <Route path="expired-events" element={<ExpiredeventsSuperadmin />} />
        <Route path="payment-history" element={<PaymenthistorySuperadmin />} />
        <Route path="eventgroup-profile" element={<EventgroupProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="event-details" element={<AdminEventDetails />} />
        <Route path="employee-details" element={<EmployeeDetails />} />
        <Route path="add-category" element={<AddCategory />} />
        <Route path="registered-users" element={<RegisteredUserTable />} />
        <Route path="user-profile" element={<Userprofile />} />
      </Route>

      {/* Employee Routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="scanner" replace />} />
        <Route path="scanner" element={<MealScanner />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="/"
        element={
          auth.token ? (
            <Navigate to={`/${auth.user?.role?.toLowerCase()}/dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch all other routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
