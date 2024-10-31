import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarSuperadmin from '../Components/Sidebars/SidebarSuperadmin';
import Navcomponent from '../Components/Navcomponent';

const SuperadminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <SidebarSuperadmin isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <div className="w-full transition-all duration-300 lg:ml-[300px] overflow-x-hidden bg-[#f7fafc]">
        {/* Navbar */}
        <Navcomponent toggleSidebar={toggleSidebar} />

        {/* Page content */}
        <Outlet />
      </div>
    </div>
  );
};

export default SuperadminLayout;
