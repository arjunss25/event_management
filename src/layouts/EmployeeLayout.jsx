import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navcomponent from '../Components/Navcomponent';
import SidebarEmployee from '../Components/Sidebars/SidebarEmployee';


const EmployeeLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
      setSidebarOpen((prev) => !prev);
    };
  
    return (
      <div className="flex">
        {/* Sidebar */}
        <SidebarEmployee isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
  
        {/* Main content area */}
        <div className="w-full transition-all duration-300 lg:ml-[300px] overflow-x-hidden bg-[#f7fafc]">
          {/* Navbar */}
          <Navcomponent toggleSidebar={toggleSidebar} />
          <div className="page-content pb-10 px-10">
            <Outlet />
          </div>
        </div>
      </div>
  )
}

export default EmployeeLayout