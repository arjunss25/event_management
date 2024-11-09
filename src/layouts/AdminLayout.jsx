import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarAdmin from '../Components/Sidebars/SidebarAdmin';
import AdminNavcomponent from '../Components/Admin/AdminNavcomponent';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <SidebarAdmin isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <div className="w-full transition-all duration-300 lg:ml-[300px] overflow-x-hidden bg-[#f7fafc]">
        {/* Navbar */}
        <AdminNavcomponent toggleSidebar={toggleSidebar} />

        {/* Page content */}
        <div className="pages-com p-4 lg:p-8">
        <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;