import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Access Redux state

import SidebarSuperadmin from '../Components/Sidebars/SidebarSuperadmin';
import Navcomponent from '../Components/Navcomponent';

const SuperadminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  

  const auth = useSelector((state) => state.auth);


  if (!auth.token || auth.user?.role?.toLowerCase() !== 'superadmin') {

    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarSuperadmin isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-[300px] overflow-x-hidden bg-[#f7fafc]">
        {/* Navbar */}
        <Navcomponent toggleSidebar={toggleSidebar} />

        {/* Page content with proper padding and scrolling */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperadminLayout;
