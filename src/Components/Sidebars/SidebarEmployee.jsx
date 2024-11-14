import React from 'react';
import { MdQrCodeScanner } from "react-icons/md";
import { IoPersonCircleOutline } from "react-icons/io5";
import { AiOutlineLogout, AiOutlineClose } from "react-icons/ai";
import { Link, useLocation } from 'react-router-dom';

const SidebarEmployee = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getLinkClass = (path) => (
    `sidebar-link flex items-center gap-4 hover:text-black ${
      isActive(path) ? 'text-black' : 'text-[#636e72]'
    }`
  );

  return (
    <>
    
      <div 
        className={`fixed left-0 top-0 z-[10] w-full sm:w-[300px] lg:w-[300px] h-screen bg-white border-r border-[#e6e6e6] transition-transform duration-300 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="w-full relative">
          {/* Close button for mobile screens */}
          <div className="absolute top-4 right-4 lg:hidden cursor-pointer" onClick={toggleSidebar}>
            <AiOutlineClose className="text-2xl text-gray-600 hover:text-black" />
          </div>

          {/* Logo section */}
          <div className="logo-section w-full h-[30vh] flex items-center justify-center lg:justify-start lg:ml-10">
            <img className="w-[10rem] lg:w-[12rem]" src="/Neurocode2.png" alt="Logo" />
          </div>

          {/* Sidebar links */}
          <div className="sidebar-links flex justify-center lg:justify-start lg:ml-10 text-[1.2rem]">
            <ul className="flex flex-col gap-6">
              <li>
                <Link to="/employee" className={getLinkClass('/employee')} onClick={toggleSidebar}>
                    <MdQrCodeScanner />
                  <span>Meal scanner</span>
                </Link>
              </li>
              <li>
                <Link to="/event-groups" className={getLinkClass('/event-groups')} onClick={toggleSidebar}>
                <IoPersonCircleOutline />
                  <span>profile</span>
                </Link>
              </li>
              <li>
                <a href="#" className="sidebar-link flex items-center gap-4 hover:text-black text-[#636e72]">
                  <AiOutlineLogout className="icon-size" />
                  <span>Logout</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Overlay for small screens when sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden"
        ></div>
      )}
    </>
  );
};

export default SidebarEmployee