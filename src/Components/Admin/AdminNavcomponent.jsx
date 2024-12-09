import React, { useState, useEffect, useRef } from 'react';
import { HiMenuAlt1 } from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../../Redux/authSlice';
import { IoLogOutOutline, IoCloseOutline } from 'react-icons/io5';
import { BsQrCodeScan } from 'react-icons/bs';
import QrScanner from 'react-qr-scanner';
import axiosInstance from '../../axiosConfig';
import EmployeeCheckinDetails from './EmployeeCheckinDetails';
import imageCompression from 'browser-image-compression';
import { ImagePlus, Camera } from 'lucide-react';

// const originalConsoleError = console.error;
// console.error = (...args) => {
//   if (args[0]?.includes('defaultProps')) return;
//   if (args[0]?.includes('willReadFrequently')) return;
//   originalConsoleError(...args);
// };

// Create a simple event bus
const eventBus = {
  listeners: new Set(),
  emit() {
    this.listeners.forEach(listener => listener());
  },
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
};

export { eventBus }; // Export for use in SidebarAdmin

const AdminNavcomponent = ({ toggleSidebar }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [logoImage, setLogoImage] = useState('/Neurocode.png');
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [scanResult, setScanResult] = useState({ success: false, message: '' });
  const [pauseScanning, setPauseScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
      }
    };

    fetchEventLogo();
  }, [refreshKey]);

  const resetScannerState = () => {
    setPauseScanning(false);
    setScanError(null);
    setIsScanning(false);
    setTimeout(() => {
      setIsScanning(true);
    }, 100);
  };

  const handleScan = async (data) => {
    if (data && isScanning && !pauseScanning) {
      setPauseScanning(true);
      setScanError(null);

      try {
        const emailMatch = data.text.match(/Email: (.*?)(?:$|,|\s)/);
        const email = emailMatch ? emailMatch[1] : null;

        if (!email) {
          setScanResult({
            success: false,
            message: 'Invalid QR code. Please try again.',
          });
          setShowStatusModal(true);
          return;
        }

        const response = await axiosInstance.post('/employee-qr-detail/', {
          employee_email: email,
        });

        if (
          response.data.status === "Success 'Ok'." ||
          response.data.status === 'Success'
        ) {
          setEmployeeDetails(response.data.data);
          setShowScanner(false);
          setScanResult({
            success: true,
            message: 'Employee details retrieved successfully',
          });
        } else {
          setScanResult({
            success: false,
            message: response.data.message || 'Failed to get employee details',
          });
        }
        setShowStatusModal(true);
      } catch (error) {
        setScanResult({
          success: false,
          message: 'Scan failed. Please try again.',
        });
        setShowStatusModal(true);
      }
    }
  };

  const handleCheckin = async () => {
    try {
      const response = await axiosInstance.post(
        '/employee-check-in-out/checkin/',
        {
          employee_email: employeeDetails.email,
        }
      );

      if (response.data.status === 'Success') {
        setEmployeeDetails(null);
        setShowScanner(true);
        setIsScanning(true);
        setPauseScanning(false);
        setScanResult({
          success: true,
          message: 'Check-in successful! Employee has been checked in.',
        });
        setShowStatusModal(true);
      } else {
        setScanResult({
          success: false,
          message:
            'Check-in failed: ' + (response.data.message || 'Unknown error'),
        });
        setShowStatusModal(true);
      }
    } catch (error) {
      setScanResult({
        success: false,
        message:
          'Check-in failed: ' +
          (error.response?.data?.message || 'Server error'),
      });
      setShowStatusModal(true);
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await axiosInstance.post(
        '/employee-check-in-out/checkout/',
        {
          employee_email: employeeDetails.email,
        }
      );

      if (response.data.status === 'Success') {
        setEmployeeDetails(null);
        setShowScanner(true);
        setIsScanning(true);
        setPauseScanning(false);
        setScanResult({
          success: true,
          message: 'Check-out successful! Employee has been checked out.',
        });
        setShowStatusModal(true);
      } else {
        setScanResult({
          success: false,
          message:
            'Check-out failed: ' + (response.data.message || 'Unknown error'),
        });
        setShowStatusModal(true);
      }
    } catch (error) {
      setScanResult({
        success: false,
        message:
          'Check-out failed: ' +
          (error.response?.data?.message || 'Server error'),
      });
      setShowStatusModal(true);
    }
  };

  const handleError = (error) => {

  };

  const previewStyle = {
    width: '100%',
    height: '100%',
    willReadFrequently: true,
  };

  const closeScanner = () => {
    setShowScanner(false);
    setScanError(null);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(true);
    }, 100);
  };

  const toggleScanner = () => {
    if (showScanner) {
      closeScanner();
    } else {
      setShowScanner(true);
      setIsScanning(true);
    }
  };

  const handleStatusModalClose = () => {
    setShowStatusModal(false);
    resetScannerState();

    // Small delay to ensure clean state before next scan
    setTimeout(() => {
      setPauseScanning(false);
    }, 100);
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1000,
      useWebWorker: true,
      initialQuality: 0.6,
      fileType: 'image/jpeg',
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      throw error;
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        const compressedFile = await compressImage(file);
        setSelectedFile(compressedFile);
        handleImageUpload(compressedFile);
      } catch (error) {
        setUploadError('Failed to process image. Please try again.');
        setIsUploading(false);
      }
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file, 'profile.jpg');

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await axiosInstance.patch('/update-event-dp/', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });
      const newImageUrl = response.data.data.image;
      setLogoImage(newImageUrl);
      setShowProfile(false);
      setRefreshKey(prevKey => prevKey + 1);
      eventBus.emit(); // Notify other components to refresh
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      key={refreshKey}
      className="w-full font-bold h-[8vh] flex items-center justify-between lg:justify-end px-5 py-8 lg:px-10 lg:py-10"
    >
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
            onClick={toggleScanner}
            className="text-[2rem] text-[#636e72] hover:text-black transition-colors duration-200"
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
                    <h2 className="text-xl font-semibold text-gray-800">
                      Scan QR Code
                    </h2>
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
                        key={`scanner-${pauseScanning}`}
                        delay={300}
                        onError={handleError}
                        onScan={handleScan}
                        style={previewStyle}
                        constraints={{
                          video: { facingMode: 'environment' },
                        }}
                      />
                    )}
                    <div className="absolute inset-0 border-2 border-white/30">
                      <div className="absolute inset-0 border-2 border-white/30 m-8"></div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-center mt-4 text-sm">
                    Position the QR code within the frame to scan
                  </p>
                </div>

                {/* Add Status Modal */}
                {showStatusModal && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                      className={`bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4 ${
                        scanResult.success
                          ? 'border-green-500'
                          : 'border-red-500'
                      } border-2`}
                    >
                      <div
                        className={`text-lg font-semibold mb-2 ${
                          scanResult.success ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {scanResult.success
                          ? 'Scan Successful!'
                          : 'Scan Failed!'}
                      </div>
                      <p className="text-gray-600 mb-4">{scanResult.message}</p>
                      <button
                        onClick={handleStatusModalClose}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Continue Scanning
                      </button>
                    </div>
                  </div>
                )}

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
            className="w-10 h-10 rounded-full border-[1px] border-[#636e72] flex items-center justify-center cursor-pointer overflow-hidden"
            onClick={() => setShowProfile(!showProfile)}
          >
            <img
              key={refreshKey}
              className="w-full h-full object-cover"
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
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-blue-400 transition-all duration-300 relative"
                >
                  <img
                    key={refreshKey}
                    src={logoImage}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.src = '/Neurocode.png';
                    }}
                  />
                  <Camera className="absolute bottom-2 right-2 text-gray-500" />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {isUploading && (
                  <div className="text-center text-sm text-gray-600">
                    Uploading...
                  </div>
                )}

                {uploadError && (
                  <div className="text-center text-sm text-red-500">
                    {uploadError}
                  </div>
                )}

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
          onClose={() => {
            setEmployeeDetails(null);
            setShowScanner(true);
            setIsScanning(true);
            setPauseScanning(false);
          }}
          onCheckin={handleCheckin}
          onCheckout={handleCheckout}
          setShowScanner={setShowScanner}
        />
      )}
    </div>
  );
};

export default AdminNavcomponent;
