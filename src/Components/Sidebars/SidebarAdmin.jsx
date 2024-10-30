import React from 'react';
import { LuLayoutDashboard } from "react-icons/lu";
import { MdGroups3 } from "react-icons/md";
import { MdOutlineFestival } from "react-icons/md";
import { IoTimerOutline } from "react-icons/io5";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { AiOutlineLogout } from "react-icons/ai";
import { Link, useLocation } from 'react-router-dom';

const SidebarAdmin = () => {

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
            <Link to="/admin" className={getLinkClass('/admin')}>
              <LuLayoutDashboard className="icon-size" />
              <span className="hidden lg:block">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="" className={getLinkClass('')}>
              <MdGroups3 className="icon-size" />
              <span className="hidden lg:block">Events</span>
            </Link>
          </li>
          <li>
            <Link 
              to="" 
              className={getLinkClass('')}
            >
              <MdOutlineFestival className="icon-size" />
              <span className="hidden lg:block">Employees</span>
            </Link>
          </li>
          <li>
            <Link 
              to="" 
              className={getLinkClass('')}
            >
              <IoTimerOutline className="icon-size" />
              <span className="hidden lg:block">Id Card</span>
            </Link>
          </li>
          <li>
            <Link 
              to="" 
              className={getLinkClass('')}
            >
              <FaMoneyBillTransfer className="icon-size" />
              <span className="hidden lg:block">Logout</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SidebarAdmin