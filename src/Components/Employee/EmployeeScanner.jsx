import React, { useState, useEffect } from 'react';
import QrReader from 'react-qr-scanner';
import { X, Camera, ScanLine } from 'lucide-react';

const EmployeeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [flashlight, setFlashlight] = useState(false);
  const [camera, setCamera] = useState(null);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (camera) {
        const stream = camera.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, [camera]);

  const handleScan = (data) => {
    if (data) {
      // Add vibration feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      
      setScannedData(data);
      setScanning(false);
      // Here you can handle the scanned data, e.g., make an API call
      console.log('Scanned QR Code:', data);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const handleClose = () => {
    setScanning(false);
    setScannedData(null);
    setFlashlight(false);
  };

  const toggleFlashlight = async () => {
    if (camera && camera.srcObject) {
      const track = camera.srcObject.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        const newFlashlight = !flashlight;
        await track.applyConstraints({
          advanced: [{ torch: newFlashlight }]
        });
        setFlashlight(newFlashlight);
      }
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
      {scanning ? (
        // Enhanced full-screen scanner overlay
        <div className="fixed inset-0 bg-black z-50">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/70 to-transparent z-50 flex items-center justify-between px-4">
            <button 
              onClick={handleClose}
              className="text-white p-2 rounded-full hover:bg-white/10"
            >
              <X size={24} />
            </button>
            <span className="text-white font-medium">Scan QR Code</span>
            <button
              onClick={toggleFlashlight}
              className={`text-white p-2 rounded-full ${flashlight ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              {/* You can replace this with a flashlight icon */}
              <Camera size={24} />
            </button>
          </div>

          {/* Scanner container with improved styling */}
          <div className="relative h-full w-full bg-black">
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              className="w-full h-full"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              constraints={{
                video: { 
                  facingMode: 'environment',
                  width: { ideal: 1920 },
                  height: { ideal: 1080 }
                }
              }}
              ref={node => {
                if (node) {
                  setCamera(node.el);
                }
              }}
            />
            
            {/* Enhanced scanning overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Improved scanning frame */}
              <div className="relative w-72 h-72 mb-8">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
                
                {/* Scanner window */}
                <div className="absolute inset-0">
                  {/* Animated border with gradient */}
                  <div className="absolute inset-0 border-2 border-white/30">
                    {/* Scanning animation */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
                  </div>
                  
                  {/* Enhanced corner markers */}
                  <div className="absolute top-0 left-0 w-12 h-12">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400" />
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400" />
                  </div>
                  <div className="absolute top-0 right-0 w-12 h-12">
                    <div className="absolute top-0 right-0 w-full h-1 bg-emerald-400" />
                    <div className="absolute top-0 right-0 w-1 h-full bg-emerald-400" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-12 h-12">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-400" />
                    <div className="absolute bottom-0 left-0 w-1 h-full bg-emerald-400" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-12 h-12">
                    <div className="absolute bottom-0 right-0 w-full h-1 bg-emerald-400" />
                    <div className="absolute bottom-0 right-0 w-1 h-full bg-emerald-400" />
                  </div>
                </div>
              </div>
              
              {/* Improved scanning text */}
              <div className="text-center space-y-2">
                <p className="text-white/90 text-lg font-medium">
                  Align QR code within frame
                </p>
                <p className="text-white/60 text-sm">
                  Scanning will start automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Enhanced modal design
        <div className="bg-white rounded-2xl w-[90%] md:w-[400px] py-8 px-6 relative shadow-2xl">
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
          
          {/* Enhanced Header */}
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Breakfast</h1>
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-medium">
              DAY - 5
            </span>
          </div>

          {/* Enhanced QR Code Section */}
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

            {/* Enhanced Non-registered Button */}
            <button className="w-full max-w-xs border-2 border-gray-900 rounded-xl py-4 px-6 hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.02]">
              <span className="text-gray-900 font-medium tracking-wider">
                NON-REGISTERED USER
              </span>
            </button>
          </div>

          {/* Enhanced Scanned Data Display */}
          {scannedData && (
            <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 font-medium mb-1">
                <Camera size={16} />
                <span>Scan Successful!</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{scannedData.text}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeScanner;