import React from 'react';
import { LuLayoutDashboard } from "react-icons/lu";
import { MdGroups3, MdOutlineFestival } from "react-icons/md";
import { IoTimerOutline } from "react-icons/io5";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { AiOutlineLogout, AiOutlineClose } from "react-icons/ai";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../Redux/authSlice'; 

const SidebarSuperadmin = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isActive = (path) => location.pathname === `/superadmin${path}`;

  const getLinkClass = (path) => (
    `sidebar-link flex items-center gap-4 hover:text-black ${
      isActive(path) ? 'text-black' : 'text-[#636e72]'
    }`
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

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
                <Link to="/superadmin/dashboard" className={getLinkClass('/dashboard')} onClick={toggleSidebar}>
                  <LuLayoutDashboard className="icon-size" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/eventgroups" className={getLinkClass('/eventgroups')} onClick={toggleSidebar}>
                  <MdGroups3 className="icon-size" />
                  <span>Event Groups</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/events" className={getLinkClass('/events')} onClick={toggleSidebar}>
                  <MdOutlineFestival className="icon-size" />
                  <span>Events</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/expired-events" className={getLinkClass('/expired-events')} onClick={toggleSidebar}>
                  <IoTimerOutline className="icon-size" />
                  <span>Expired</span>
                </Link>
              </li>
              <li>
                <Link to="/superadmin/payment-history" className={getLinkClass('/payment-history')} onClick={toggleSidebar}>
                  <FaMoneyBillTransfer className="icon-size" />
                  <span>Payment</span>
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout} 
                  className="sidebar-link flex items-center gap-4 hover:text-black text-[#636e72]"
                >
                  <AiOutlineLogout className="icon-size" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Overlay for small screens when sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-[9] lg:hidden"
        ></div>
      )}
    </>
  );
};

export default SidebarSuperadmin;