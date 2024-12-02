import React, { useState, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import { X, Camera } from 'lucide-react';
import axiosInstance from '../../axiosConfig';

const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes('defaultProps')) return;
  if (args[0]?.includes('willReadFrequently')) return;
  originalConsoleError(...args);
};

const EmployeeScanner = ({ onClose, mealInfo }) => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [flashlight, setFlashlight] = useState(false);
  const [camera, setCamera] = useState(null);
  const [scanStatus, setScanStatus] = useState({ loading: false, error: null });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [scanResult, setScanResult] = useState({ success: false, message: '' });
  const [pauseScanning, setPauseScanning] = useState(false);

  // Reset scanner state completely
  const resetScannerState = () => {
    setPauseScanning(false);
    setScannedData(null);
    setScanResult({ success: false, message: '' });
  };

  const handleScan = async (data) => {
    if (data?.text && mealInfo && !pauseScanning) {
      setPauseScanning(true);
      try {
        console.log('Scanned Data:', data);
        const uniqueIdMatch = data.text.match(/Unique ID: (\w+)/);
        const uniqueId = uniqueIdMatch ? uniqueIdMatch[1] : null;

        if (!uniqueId) {
          throw new Error('Invalid QR code format');
        }

        if (!mealInfo.date || !mealInfo.mealCategory) {
          throw new Error('Please select a meal and date first.');
        }

        const [day, month, year] = mealInfo.date.split('-');
        const formattedDate = `${year}-${month}-${day}`;

        const payload = {
          unique_id: uniqueId,
          meal_type_name: mealInfo.mealCategory,
          meal_date: formattedDate,
        };

        const response = await axiosInstance.post('/scan-meals/', payload);
        console.log('API Response:', response.data);

        setScanResult({
          success: true,
          message: 'Meal scanned successfully',
        });
        setShowStatusModal(true);
      } catch (error) {
        console.error('Scan API Error:', error);
        setScanResult({
          success: false,
          message: error.message || 'Failed to process scan',
        });
        setShowStatusModal(true);
      }
    }
  };

  const handleError = (err) => {
    if (err instanceof Error) {
      console.error('Scanner Error:', err.message);
    }
  };

  const handleClose = () => {
    setScanning(false);
    setScannedData(null);
    setFlashlight(false);
    onClose();
  };

  const toggleFlashlight = async () => {
    if (camera && camera.srcObject) {
      const track = camera.srcObject.getVideoTracks()[0];
      const capabilities = track.getCapabilities();

      if (capabilities.torch) {
        const newFlashlight = !flashlight;
        await track.applyConstraints({
          advanced: [{ torch: newFlashlight }],
        });
        setFlashlight(newFlashlight);
      }
    }
  };

  const previewStyle = {
    width: '100%',
    height: '100%',
    willReadFrequently: true,
  };

  const handleStatusModalClose = () => {
    setShowStatusModal(false);
    resetScannerState();
    
    // Small delay to ensure clean state before next scan
    setTimeout(() => {
      setPauseScanning(false);
    }, 100);
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (camera) {
        const stream = camera.srcObject;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
      resetScannerState();
    };
  }, [camera]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      {scanning ? (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl relative max-w-md w-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  Scan QR Code
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="text-2xl text-gray-600" />
                </button>
              </div>
            </div>

            {/* Scanner Container */}
            <div className="p-6">
              <div className="relative w-full aspect-square max-w-[400px] mx-auto rounded-lg overflow-hidden bg-gray-900">
                <QrScanner
                  key={`scanner-${pauseScanning}`} // Force re-render when scanning state changes
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  style={previewStyle}
                  constraints={{
                    video: { facingMode: 'environment' },
                  }}
                  ref={(node) => {
                    if (node) {
                      setCamera(node.el);
                    }
                  }}
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
                onClick={handleClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors duration-200"
              >
                Close Scanner
              </button>
            </div>

            {/* Add Status Modal */}
            {showStatusModal && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div
                  className={`bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4 ${
                    scanResult.success ? 'border-green-500' : 'border-red-500'
                  } border-2`}
                >
                  <div
                    className={`text-lg font-semibold mb-2 ${
                      scanResult.success ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {scanResult.success ? 'Scan Successful!' : 'Scan Failed!'}
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
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl w-[90%] md:w-[400px] py-8 px-6 relative shadow-2xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {mealInfo?.mealCategory}
            </h1>
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-medium">
              {mealInfo?.date}
            </span>
          </div>

          <div className="flex flex-col items-center gap-6">
            <button
              onClick={() => setScanning(true)}
              className="bg-gray-900 p-6 rounded-xl w-full max-w-xs hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] group"
            >
              <div className="aspect-video flex flex-col items-center justify-center relative">
                <div className="w-36 h-32 flex items-center justify-center relative">
                  <img
                    src="/ffgd.png"
                    alt="QR Code"
                    className="group-hover:opacity-50 transition-opacity"
                  />
                  <Camera
                    className="absolute text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    size={32}
                  />
                </div>
                <p className="text-white text-center mt-4 text-sm tracking-wider font-medium">
                  SCAN QR CODE
                </p>
              </div>
            </button>

            <button className="w-full max-w-xs border-2 border-gray-900 rounded-xl py-4 px-6 hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.02]">
              <span className="text-gray-900 font-medium tracking-wider">
                NON-REGISTERED USER
              </span>
            </button>
          </div>

          {(scannedData || scanStatus.error) && (
            <div
              className={`mt-6 p-4 rounded-xl border ${
                scanStatus.error
                  ? 'bg-red-50 border-red-100'
                  : 'bg-emerald-50 border-emerald-100'
              }`}
            >
              <div
                className={`flex items-center gap-2 font-medium mb-1 ${
                  scanStatus.error ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                <Camera size={16} />
                <span>
                  {scanStatus.error ? 'Scan Failed!' : 'Scan Successful!'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {scanStatus.error || 'Meal scanned successfully'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeScanner;
