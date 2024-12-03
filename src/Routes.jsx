import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Import Superadmin Components
import SuperadminLayout from './layouts/SuperadminLayout';
import EventgroupsSuperadmin from './pages/Superadmin/EventgroupsSuperadmin';
import SuperadminDashboard from './Dashboards/SuperadminDashboard';
import EventsSuperadmin from './pages/Superadmin/EventsSuperadmin';
import ExpiredeventsSuperadmin from './pages/Superadmin/ExpiredeventsSuperadmin';
import PaymenthistorySuperadmin from './pages/Superadmin/PaymenthistorySuperadmin';
import EventgroupProfile from './pages/Superadmin/EventgroupProfile';

// Import Admin Components
import AdminLayout from './layouts/AdminLayout';
import AdminEvents from './pages/Admin/AdminEvents';
import AdminEventDetails from './pages/Admin/AdminEventDetails';
import AdminWelcomePage from './pages/Admin/AdminWelcomepage';
import ProfilePhotoPage from './pages/Admin/AdminPhotoPage';
import AdminDashboardPage from './Dashboards/AdminDashboard';
import EmployeeDetails from './pages/Admin/EmployeeDetails';
import AddCategory from './pages/Admin/AddCategory';
import Userprofile from './pages/Admin/UserProfile';
import RegisteredUserTable from './Components/Admin/RegisteredUserTable';
import AdminEventsList from './pages/Admin/AdminEventsList';

// Import Other Components
import Login from './Components/Login';
import MealScanner from './pages/Employee/MealScanner';
import EmployeeLayout from './layouts/EmployeeLayout';
import AddEmpolyee from './pages/Admin/Addemployee';
import AdminEmployeeProfile from './pages/Admin/AdminEmployeeProfile';
import AdminEventsAssignedTable from './Components/Admin/AdminEventsAssignedTable';
import EmployeeScanner from './Components/Employee/EmployeeScanner';
import EmployeeProfile from './pages/Employee/EmployeeProfile';
import UserProfile from './pages/Admin/UserProfile';

const ProtectedRoute = ({ children, requiredRole }) => {
  const auth = useSelector((state) => state.auth);

  const userRole = auth.user?.role?.trim().toLowerCase();
  const expectedRole = requiredRole?.trim().toLowerCase();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (expectedRole && userRole !== expectedRole) {
    switch (userRole) {
      case 'superadmin':
        return <Navigate to="/superadmin/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/welcomepage" replace />;
      case 'employee':
        return <Navigate to="/employee/scanner" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  const auth = useSelector((state) => state.auth);
  const location = useLocation();

  const getInitialRoute = () => {
    if (!auth.token) return '/login';

    switch (auth.user?.role?.toLowerCase()) {
      case 'admin':
        return '/admin/welcomepage';
      case 'superadmin':
        return '/superadmin/dashboard';
      case 'employee':
        return '/employee/scanner';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={
          auth.token ? <Navigate to={getInitialRoute()} replace /> : <Login />
        }
      />

      {/* Superadmin Routes */}
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperadminLayout />
          </ProtectedRoute>
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
        <Route index element={<Navigate to="welcomepage" replace />} />
        <Route path="welcomepage" element={<AdminWelcomePage />} />
        <Route path="profile-photo" element={<ProfilePhotoPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="event-details" element={<AdminEventDetails />} />
        <Route path="employee-details" element={<EmployeeDetails />} />
        <Route path="add-category" element={<AddCategory />} />
        <Route path="registered-users" element={<RegisteredUserTable />} />
        <Route path="user/:id" element={<UserProfile />} />
        <Route path="user-profile" element={<Userprofile />} />
        <Route path="add-employee" element={<AddEmpolyee />} />
        {/* <Route path="employee-profile" element={<AdminEmployeeProfile />} /> */}
        <Route path="employee-profile/:id" element={<AdminEmployeeProfile />} />
        <Route
          path="events-assigned-table"
          element={<AdminEventsAssignedTable />}
        />
      </Route>

      {/* Add a separate route for events-list outside the AdminLayout */}
      <Route
        path="/admin/events-list"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminEventsList />
          </ProtectedRoute>
        }
      />

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
        <Route path="profile" element={<EmployeeProfile />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="/"
        element={
          auth.token ? (
            <Navigate to={getInitialRoute()} replace />
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
