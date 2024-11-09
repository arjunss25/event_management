import React, { useState } from 'react';
import { LuLayoutDashboard } from "react-icons/lu";
import { MdGroups3, MdOutlineFestival } from "react-icons/md";
import { IoTimerOutline } from "react-icons/io5";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { AiOutlineLogout, AiOutlineClose } from "react-icons/ai";
import { Link, useLocation } from 'react-router-dom';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const SidebarAdmin = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const [isEmployeesOpen, setIsEmployeesOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const getLinkClass = (path) => (
    `sidebar-link flex items-center gap-4 hover:text-black ${
      isActive(path) ? 'text-black' : 'text-[#636e72]'
    }`
  );

  const toggleEmployees = () => {
    setIsEmployeesOpen(!isEmployeesOpen);
  };

  return (
    <>
      <div 
        className={`fixed left-0 top-0 z-20 w-full sm:w-[300px] lg:w-[300px] h-screen bg-white border-r border-[#e6e6e6] transition-transform duration-300 
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
                <Link to="/admin" className={getLinkClass('/admin')} onClick={toggleSidebar}>
                  <LuLayoutDashboard className="icon-size" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/admin-events" className={getLinkClass('/admin/admin-events')} onClick={toggleSidebar}>
                  <MdGroups3 className="icon-size" />
                  <span>Events</span>
                </Link>
              </li>
              <li className="flex flex-col">
                <button 
                  onClick={toggleEmployees}
                  className={`sidebar-link flex items-center justify-between gap-4 hover:text-black text-[#636e72] w-full`}
                >
                  <div className="flex items-center gap-4">
                    <MdOutlineFestival className="icon-size" />
                    <span>Employees</span>
                  </div>
                  {isEmployeesOpen ? (
                    <FiChevronUp className="text-xl" />
                  ) : (
                    <FiChevronDown className="text-xl" />
                  )}
                </button>
                {isEmployeesOpen && (
                  <ul className="ml-8 mt-2 flex flex-col gap-2">
                    <li>
                      <Link 
                        to="/admin/employee-details" 
                        className={`${getLinkClass('/admin/employee-details')} text-base`}
                        onClick={toggleSidebar}
                      >
                        Employee Details
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/add-category" 
                        className={`${getLinkClass('/admin/add-category')} text-base`}
                        onClick={toggleSidebar}
                      >
                        Add Category
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <Link to="/admin/admin-idcard" className={getLinkClass('/admin/admin-idcard')} onClick={toggleSidebar}>
                  <IoTimerOutline className="icon-size" />
                  <span>Id Card</span>
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

export default SidebarAdmin;