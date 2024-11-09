import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SuperadminLayout from './layouts/SuperAdminLayout';
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


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<SuperadminLayout />}>
        <Route index element={<SuperadminDashboard />} />
        <Route path="event-groups" element={<EventgroupsSuperadmin />} />
        <Route path="events-superadmin" element={<EventsSuperadmin />} />
        <Route
          path="expiredevents-superadmin"
          element={<ExpiredeventsSuperadmin />}
        />
        <Route
          path="paymenthistory-superadmin"
          element={<PaymenthistorySuperadmin />}
        />
        <Route path="login" element={<Login />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="admin-events" element={<AdminEvents />} />
        <Route path="admin-events/:eventId" element={<AdminEventDetails />} />
        <Route path="employee-details" element={<EmployeeDetails />} />
        <Route path="add-category" element={<AddCategory/>} />
        {/* Add these two new routes */}
        <Route path="registered-users" element={<RegisteredUserTable />} />
        <Route path="user-profile/:userId" element={<Userprofile />} />
      </Route>

      <Route path="/employee" element={<EmployeeLayout />}>
        <Route index element={<MealScanner />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;