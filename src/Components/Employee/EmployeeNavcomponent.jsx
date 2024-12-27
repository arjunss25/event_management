import React, { useState } from 'react';
import { HiMenuAlt1 } from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../../Redux/authSlice.jsx';
import { IoLogOutOutline, IoCloseOutline } from 'react-icons/io5';

const EmployeeNavcomponent = ({ toggleSidebar }) => {
  const [showProfile, setShowProfile] = useState(false);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  return (
    <div className="w-full font-bold h-[8vh] flex items-center justify-between lg:justify-end px-5 py-8 lg:px-10 lg:py-10 fixed top-0 right-0 bg-white z-[9]">
      {/* left-section for small screens */}
      <div className="block lg:hidden">
        <button 
          onClick={toggleSidebar}
          className="text-[2rem] text-[#636e72] hover:text-black transition-colors duration-200"
        >
          <HiMenuAlt1 />
        </button>
      </div>

      {/* right-section */}
      <div className="flex items-center space-x-6">
        {/* Profile Button */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors duration-200"
          >
            <img
              className="w-full h-full object-cover"
              src="/profile-avatar.png"
              alt="Profile"
            />
          </button>
          
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
                <div className="w-20 h-20 mx-auto mb-3 rounded-full border-2">
                  <img
                    src="/profile-avatar.png"
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <div className="font-medium text-sm text-gray-800">
                  {user?.role || 'Employee'}
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

export default EmployeeNavcomponent;
