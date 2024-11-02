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
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="admin-events" element={<AdminEvents />} />
        <Route path="admin-events/:eventId" element={<AdminEventDetails />} />
      </Route>

      {/* <Route path="/employee" element={<EmployeeLayout />}>
        <Route index element={<EmployeeDashboard />} />
        
      </Route> */}
    </Routes>
  );
};

export default AppRoutes;
