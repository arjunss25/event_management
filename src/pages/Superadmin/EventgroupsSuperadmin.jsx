import React, { useState, useEffect } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import { FaTimes } from 'react-icons/fa';
import EventgroupsSuperadminTable from '../../Components/Superadmin/EventgroupsSuperadminTable';
import axiosInstance from '../../axiosConfig';

const EventgroupsSuperadmin = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);

  const handleAddEventGroup = async (eventGroupData) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/register-eventgroup/', eventGroupData);

      if (response.status === 200) {
        alert('Event group added successfully');
        toggleDrawer();
        // Optionally, refresh or re-fetch the table data to show the new event group
      } else {
        throw new Error('Failed to add event group');
      }
    } catch (err) {
      // Checking for 401 error to refresh token
      if (err.response && err.response.status === 401) {
        try {
          // Attempt to refresh token
          await axiosInstance.post('/auth/refresh-token');
          // Retry the original request after refreshing token
          const retryResponse = await axiosInstance.post('/register-eventgroup/', eventGroupData);
          if (retryResponse.status === 200) {
            alert('Event group added successfully after token refresh');
            toggleDrawer();
          } else {
            throw new Error('Failed to add event group');
          }
        } catch (refreshError) {
          alert('Authentication error: Unable to refresh token. Please log in again.');
          // Redirect user to login if token refresh fails
        }
      } else {
        alert('Failed to add event group: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f7fafc] overflow-x-hidden">
      <div className="main-content-sec w-full p-4 md:p-6 lg:p-10">
        {/* Top Section */}
        <div className="top-sec w-full flex flex-col md:flex-row items-start md:items-center justify-between">
          <h1 className="text-[1.5rem] sm:text-[2rem] font-semibold mb-2 md:mb-0">
            Event Groups
          </h1>
          <button 
            onClick={toggleDrawer}
            className="px-3 py-2 bg-black text-white flex items-center gap-2 rounded-md text-sm md:text-base"
          >
            <IoAddOutline className="text-white" /> Add Event Group
          </button>
        </div>

        {/* Search Component */}
        <div className="search-component w-full flex justify-center md:justify-start mt-6">
          <input
            type="text"
            placeholder="Search..."
            className="w-full md:w-[60%] lg:w-[30%] px-4 py-2 text-gray-600 border-2 rounded-full focus:outline-none"
          />
        </div>

        {/* Table Section */}
        <div className="table-section mt-6 overflow-x-auto">
          <EventgroupsSuperadminTable />
        </div>
      </div>

      {/* Add Event Group Drawer */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={toggleDrawer}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-[#F0F3F5] p-5 md:p-10 rounded-t-lg shadow-lg transform transition-transform duration-300 "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with centered title */}
            <div className="relative flex justify-center items-center mb-8">
              <h2 className="text-xl font-semibold">Add Event Group</h2>
              <button 
                onClick={toggleDrawer}
                className="absolute right-0 text-gray-600 hover:text-gray-800 text-[1.5rem]"
              >
                <FaTimes />
              </button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleAddEventGroup({
                  eventGroupName: formData.get('eventGroupName'),
                  ownerName: formData.get('ownerName'),
                  email: formData.get('email'),
                  phone: formData.get('phone')
                });
              }}
              className="w-full flex flex-col items-center justify-center"
            >
              <div className="w-full max-w-6xl px-4 md:px-8">
                {/* Grid container for form fields with increased gap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16">
                  {/* Event Group Name Field */}
                  <div>
                    <label className="block text-gray-700 mb-2">Event Group Name</label>
                    <input 
                      type="text" 
                      name="eventGroupName"
                      className="w-full border p-2 rounded-3xl pl-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Enter event group name"
                      required 
                    />
                  </div>

                  {/* Owner's Name Field */}
                  <div>
                    <label className="block text-gray-700 mb-2">Owner's Name</label>
                    <input 
                      type="text" 
                      name="ownerName"
                      className="w-full border p-2 rounded-3xl pl-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Enter owner's name"
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      className="w-full border p-2 rounded-3xl pl-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    <input 
                      type="tel" 
                      name="phone"
                      className="w-full border p-2 rounded-3xl pl-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mt-10">
                  <button 
                    type="submit"
                    className="bg-black text-white px-10 py-2 rounded hover:bg-gray-800 transition-colors duration-200"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Event Group'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventgroupsSuperadmin;
