import React, { useState } from 'react';
import { HiMenuAlt1 } from "react-icons/hi";
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../../Redux/authSlice';
import { IoLogOutOutline, IoCloseOutline } from "react-icons/io5";
import { BsQrCodeScan } from "react-icons/bs";
import QrScanner from 'react-qr-scanner';

const AdminNavcomponent = ({ toggleSidebar }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const handleScan = (data) => {
    if (data) {
      console.log('QR Code detected:', data);
      setShowScanner(false);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

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
        {/* QR Scanner */}
        <div className="relative">
          <button 
            onClick={() => setShowScanner(!showScanner)} 
            className='text-[2rem] text-[#636e72] hover:text-black transition-colors duration-200'
          >
            <BsQrCodeScan />
          </button>
          
          {/* Enhanced Scanner Modal */}
          {showScanner && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl relative max-w-md w-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Scan QR Code</h2>
                    <button 
                      onClick={() => setShowScanner(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                      <IoCloseOutline className="text-2xl text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Scanner Container */}
                <div className="p-6">
                  <div className="relative w-full aspect-square max-w-[400px] mx-auto rounded-lg overflow-hidden bg-gray-900">
                    <QrScanner
                      delay={300}
                      onError={handleError}
                      onScan={handleScan}
                      style={{ width: '100%', height: '100%' }}
                    />
                    {/* Scanner Overlay */}
                    <div className="absolute inset-0 border-2 border-white/30">
                      <div className="absolute inset-0 border-2 border-white/30 m-8"></div>
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <p className="text-gray-600 text-center mt-4 text-sm">
                    Position the QR code within the frame to scan
                  </p>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setShowScanner(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors duration-200"
                  >
                    Close Scanner
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* profile-icon */}
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
                  {user?.role || 'Admin'}
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

export default AdminNavcomponent;