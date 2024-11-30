import React, { useState, useEffect } from 'react';
import { HiMenuAlt1 } from "react-icons/hi";
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../../Redux/authSlice';
import { IoLogOutOutline, IoCloseOutline } from "react-icons/io5";
import { BsQrCodeScan } from "react-icons/bs";
import QrScanner from 'react-qr-scanner';
import axiosInstance from '../../axiosConfig';
import EmployeeCheckinDetails from './EmployeeCheckinDetails';

const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes('defaultProps')) return;
  if (args[0]?.includes('willReadFrequently')) return;
  originalConsoleError(...args);
};

const AdminNavcomponent = ({ toggleSidebar }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [logoImage, setLogoImage] = useState('/Neurocode.png');
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const fetchEventLogo = async () => {
      try {
        const response = await axiosInstance.get('/update-event-dp/');
        if (response.data.data && response.data.data.image) {
          const imageUrl = response.data.data.image.startsWith('http')
            ? response.data.data.image
            : `https://event.neurocode.in${response.data.data.image}`;
          setLogoImage(imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch event logo', error);
        // Keep default logo on error
      }
    };

    fetchEventLogo();
  }, []);

  const handleScan = async (data) => {
    if (data && isScanning) {
      setIsScanning(false); // Prevent multiple scans
      setScanError(null);
      
      try {
        // Extract email from the formatted string
        const qrText = data.text;
        const emailMatch = qrText.match(/Email:\s*([\w.-]+@[\w.-]+)/);
        
        if (!emailMatch) {
          setScanError('Invalid QR code format. Please try a valid employee QR code.');
          return;
        }

        const email = emailMatch[1]; // This will get just the email part
        console.log('Extracted email:', email);

        const response = await axiosInstance.get('/employee-qr-detail/', {
          data: {
            employee_email: email
          }
        });
        
        if (response.data.status === "Success") {
          setEmployeeDetails(response.data.data);
          setShowScanner(false);
        } else {
          setScanError(response.data.message || 'Failed to get employee details');
        }
      } catch (error) {
        setScanError(error.response?.data?.message || 'Failed to scan QR code. Please try again.');
      }
    }
  };

  const handleCheckin = async () => {
    // Implement check-in logic here
    setEmployeeDetails(null);
  };

  const handleCheckout = async () => {
    // Implement check-out logic here
    setEmployeeDetails(null);
  };

  const handleError = (error) => {
    console.warn('QR Scanner Error:', error?.message);
    // You can add user notification here if needed
  };

  const previewStyle = {
    width: '100%',
    height: '100%',
    willReadFrequently: true
  };

  const closeScanner = () => {
    setShowScanner(false);
    setScanError(null);
    setIsScanning(true);
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
                      onClick={closeScanner}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                      <IoCloseOutline className="text-2xl text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Scanner Container */}
                <div className="p-6">
                  <div className="relative w-full aspect-square max-w-[400px] mx-auto rounded-lg overflow-hidden bg-gray-900">
                    {isScanning && (
                      <QrScanner
                        delay={300}
                        onError={handleError}
                        onScan={handleScan}
                        style={previewStyle}
                        constraints={{
                          video: { facingMode: "environment" }
                        }}
                      />
                    )}
                    <div className="absolute inset-0 border-2 border-white/30">
                      <div className="absolute inset-0 border-2 border-white/30 m-8"></div>
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {scanError && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                      {scanError}
                    </div>
                  )}
                  
                  {/* Instructions or Retry Button */}
                  {scanError ? (
                    <button
                      onClick={() => {
                        setScanError(null);
                        setIsScanning(true);
                      }}
                      className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Try Again
                    </button>
                  ) : (
                    <p className="text-gray-600 text-center mt-4 text-sm">
                      Position the QR code within the frame to scan
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={closeScanner}
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
            className="w-10 h-10 rounded-full border-[1px] border-[#636e72] flex items-center justify-center cursor-pointer"
            onClick={() => setShowProfile(!showProfile)}
          >
            <img 
              className='w-[1.5rem] object-contain' 
              src={logoImage}  
              alt="Profile"
              onError={(e) => {
                e.target.src = '/Neurocode.png';
              }}
            />
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

      {employeeDetails && (
        <EmployeeCheckinDetails
          employee={employeeDetails}
          onClose={() => setEmployeeDetails(null)}
          onCheckin={handleCheckin}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
};

export default AdminNavcomponent;