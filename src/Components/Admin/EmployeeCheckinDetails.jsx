import React from 'react';
import { IoCloseOutline } from "react-icons/io5";

const EmployeeCheckinDetails = ({ employee, onClose, onCheckin, onCheckout }) => {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl relative max-w-md w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Employee Details</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <IoCloseOutline className="text-2xl text-gray-600" />
            </button>
          </div>
        </div>

        {/* Employee Details */}
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <img 
              src={employee.image.startsWith('http') ? employee.image : `https://event.neurocode.in${employee.image}`}
              alt={employee.name}
              className="w-24 h-24 rounded-full object-cover mb-3"
              onError={(e) => {
                e.target.src = '/user.png';
              }}
            />
            <h3 className="text-xl font-semibold text-gray-800">{employee.name}</h3>
            <p className="text-gray-500">{employee.position}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="text-gray-800">{employee.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="text-gray-800">{employee.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="text-gray-800">{employee.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold ${employee.is_available ? 'text-green-600' : 'text-red-600'}`}>
                {employee.is_available ? 'Checked In' : 'Checked Out'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCheckout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
          >
            Check Out
          </button>
          <button
            onClick={onCheckin}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
          >
            Check In
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCheckinDetails;
