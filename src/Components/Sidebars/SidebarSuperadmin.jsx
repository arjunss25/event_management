import React from 'react';
import { LuLayoutDashboard } from "react-icons/lu";
import { MdGroups3 } from "react-icons/md";
import { MdOutlineFestival } from "react-icons/md";
import { IoTimerOutline } from "react-icons/io5";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { AiOutlineLogout } from "react-icons/ai";
import { Link, useLocation } from 'react-router-dom';

const SidebarSuperadmin = () => {
  const location = useLocation();

  
  const isActive = (path) => {
    return location.pathname === path;
  };

 
  const getLinkClass = (path) => {
    return `sidebar-link flex items-center gap-4 hover:text-black ${
      isActive(path) ? 'text-black' : 'text-[#636e72]'
    }`;
  };

  return (
    <div className="w-full">
      {/* logo-sec */}
      <div className="logo-section w-full h-[30vh] flex items-center justify-center lg:justify-start lg:ml-10">
        <img className="w-[4rem] lg:w-[12rem]" src="/Neurocode2.png" alt="Logo" />
      </div>

      {/* sidebar-links */}
      <div className="sidebar-links flex justify-center lg:justify-start lg:ml-10 text-[1.2rem]">
        <ul className="flex flex-col gap-6">
          <li>
            <Link to="/" className={getLinkClass('/')}>
              <LuLayoutDashboard className="icon-size" />
              <span className="hidden lg:block">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/event-groups" className={getLinkClass('/event-groups')}>
              <MdGroups3 className="icon-size" />
              <span className="hidden lg:block">Event Groups</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/events-superadmin" 
              className={getLinkClass('/events-superadmin')}
            >
              <MdOutlineFestival className="icon-size" />
              <span className="hidden lg:block">Events</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/expiredevents-superadmin" 
              className={getLinkClass('/expiredevents-superadmin')}
            >
              <IoTimerOutline className="icon-size" />
              <span className="hidden lg:block">Expired</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/paymenthistory-superadmin" 
              className={getLinkClass('/paymenthistory-superadmin')}
            >
              <FaMoneyBillTransfer className="icon-size" />
              <span className="hidden lg:block">Payment</span>
            </Link>
          </li>
          <li>
            <a href="#" className="sidebar-link flex items-center gap-4 hover:text-black text-[#636e72]">
              <AiOutlineLogout className="icon-size" />
              <span className="hidden lg:block">Logout</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SidebarSuperadmin;