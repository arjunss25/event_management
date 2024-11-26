import React, { useState } from 'react';
import { IoMdNotificationsOutline } from "react-icons/io";
import { HiMenuAlt1 } from "react-icons/hi";
import { useSelector } from 'react-redux';
import { selectUser } from '../Redux/authSlice';
import { IoLogOutOutline, IoCloseOutline } from "react-icons/io5";
import { useDispatch } from 'react-redux';
import { logout } from '../Redux/authSlice';

const Navcomponent = ({ toggleSidebar }) => {
  const [showProfile, setShowProfile] = useState(false);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  return (
    <div className='w-full font-bold h-[8vh] flex items-center justify-between lg:justify-end px-5 py-8 lg:px-10 lg:py-10'>
      {/* left-section for small screens */}
      <div className="left-section block lg:hidden" onClick={toggleSidebar}>
        <div className="menubar text-[2rem] text-[#636e72] hover:text-black cursor-pointer">
          <HiMenuAlt1 />
        </div>
      </div>

      {/* right-section */}
      <div className="right-sec flex items-center gap-5">
        {/* <div className="relative">
          <a href=" " className='text-[2rem] text-[#636e72] hover:text-black'>
            <IoMdNotificationsOutline />
          </a>
          <h2 className='absolute top-[-0.3rem] right-[-0.1em] min-w-[1rem] h-4 px-[0.3rem] text-[0.8rem] rounded-full bg-[#98FFE0] flex items-center justify-center text-light'>
            3
          </h2>
        </div> */}
        <div className="profile-icon relative">
          <div 
            className="w-8 h-8 rounded-full border-[1px] border-[#636e72] flex items-center justify-center cursor-pointer"
            onClick={() => setShowProfile(!showProfile)}
          >
            <img className='w-[1rem]' src="/Neurocode.png" alt="" />
          </div>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 top-10 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
              <button 
                onClick={() => setShowProfile(false)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <IoCloseOutline className="text-xl" />
              </button>

              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-medium text-sm text-gray-800">
                  {user?.role || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email}
                </div>
              </div>
              
              <div className="px-4 py-2">
                <button
                  onClick={() => dispatch(logout())}
                  className="flex items-center gap-2 w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <IoLogOutOutline className="text-lg" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navcomponent;
