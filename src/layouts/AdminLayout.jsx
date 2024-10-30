import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarAdmin from '../Components/Sidebars/SidebarAdmin';

const AdminLayout = () => {
  return (
    <div className="flex">
    {/* Sidebar */}
    <div className="fixed left-0 top-0 z-20 w-[78px] lg:w-[300px] h-screen bg-white border-r border-[#e6e6e6] transition-all duration-300">
      <SidebarAdmin />
    </div>

    {/* Main content area */}
    <div className="w-full transition-all duration-300 ml-[78px] lg:ml-[300px] overflow-x-hidden">
      <Outlet />
    </div>
  </div>
  )
}

export default AdminLayout