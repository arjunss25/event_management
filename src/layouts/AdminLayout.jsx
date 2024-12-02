import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SidebarAdmin from '../Components/Sidebars/SidebarAdmin';
import AdminNavcomponent from '../Components/Admin/AdminNavcomponent';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Get auth state from Redux store
  const auth = useSelector((state) => state.auth);

  // Check if the user is authenticated and has the 'admin' role
  if (!auth.token || auth.user?.role?.toLowerCase() !== 'admin') {
    // If not authenticated or not an admin, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Hide sidebar and navbar for welcome and profile photo pages
  const hideChrome = 
    location.pathname === '/admin/welcomepage' || 
    location.pathname === '/admin/profile-photo';

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  if (hideChrome) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarAdmin isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-[300px] overflow-x-hidden bg-[#f7fafc]">
        {/* Navbar */}
        <AdminNavcomponent toggleSidebar={toggleSidebar} />

        {/* Page content with proper padding and scrolling */}
        <main className="flex-1 px-4 md:px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;