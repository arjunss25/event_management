import React from 'react';
import { IoCloseOutline } from 'react-icons/io5';

const EmployeeCheckinDetails = ({
  employee,
  onClose,
  onCheckin,
  onCheckout,
  setShowScanner,
}) => {
  const handleCheckin = () => {
    onClose(); 
    setTimeout(() => {
      onCheckin(); 
    }, 100);
  };

  const handleCheckout = () => {
    onClose(); 
    setTimeout(() => {
      onCheckout(); 
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Employee Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <IoCloseOutline className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Employee info with modern layout */}
        <div className="p-6 space-y-6">
          {/* Profile section */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-600">
                {employee.name?.[0]?.toUpperCase() || 'E'}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {employee.name}
              </h3>
              <p className="text-gray-500">{employee.email}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="font-bold text-2xl text-gray-800">{employee.id}</p>
              <p className="text-sm text-gray-500 mt-1">Employee ID</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="font-bold text-2xl text-gray-800">
                {employee.position}
              </p>
              <p className="text-sm text-gray-500 mt-1">Position</p>
            </div>
          </div>
        </div>

        {/* Action buttons with gradient hover effect */}
        <div className="p-6 bg-gray-50 flex gap-4">
          <button
            onClick={handleCheckin}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-green-500/20"
          >
            Check In
          </button>
          <button
            onClick={handleCheckout}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-red-500/20"
          >
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCheckinDetails;
