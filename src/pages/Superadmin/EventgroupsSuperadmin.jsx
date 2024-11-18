import React, { useState, useEffect } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import { FaTimes } from 'react-icons/fa';
import EventgroupsSuperadminTable from '../../Components/Superadmin/EventgroupsSuperadminTable';
import axiosInstance from '../../axiosConfig';
import { tokenService } from '../../tokenService';

const EventgroupsSuperadmin = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Search term
  const [searchResults, setSearchResults] = useState([]); // Search results
  const [events, setEvents] = useState([]); // Events data

  const [accessToken, setAccessToken] = useState('');
  const [firebaseToken, setFirebaseToken] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = tokenService.getAccessToken();
    const fbToken = tokenService.getFirebaseToken();
    const role = tokenService.getUserRole();

    if (token && role) {
      setAccessToken(token);
      setFirebaseToken(fbToken);
      setUserRole(role);
      console.log('Tokens and role loaded successfully');
    }
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
    setError(null); // Clear any existing errors
  };

  const handleAddEventGroup = async (eventGroupData) => {
    try {
      setLoading(true);
      setError(null);

      const requestData = {
        company_name: eventGroupData.eventGroupName,
        owner_name: eventGroupData.ownerName,
        email: eventGroupData.email,
        phone: eventGroupData.phone,
      };

      console.log('Sending request with data:', requestData);

      const response = await axiosInstance.post('/register-eventgroup/', requestData);

      console.log('API Response:', response);

      if (response.status === 200 || response.status === 201) {
        alert('Event group added successfully');
        toggleDrawer();
      }
    } catch (err) {
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      let errorMessage = 'Failed to add event group';

      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.message || 'Invalid data provided';
            break;
          case 401:
            errorMessage = 'Please log in again to continue';
            tokenService.clearTokens();
            window.location.href = '/login';
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action';
            break;
          case 404:
            errorMessage = 'Service endpoint not found. Please contact support.';
            break;
          case 422:
            errorMessage = err.response.data?.message || 'Invalid event group data';
            break;
          default:
            errorMessage = err.response.data?.message || 'An unexpected error occurred';
        }
      } else if (err.request) {
        errorMessage = 'Unable to reach the server. Please check your connection.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (name) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(`/search-eventgroup/${name}`);
      console.log('Search API Response:', response);

      if (response.status === 200) {
        setSearchResults(response.data?.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError('Failed to fetch search results');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      handleSearch(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

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
        {/* <div className="search-component w-full flex justify-center md:justify-start mt-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full md:w-[60%] lg:w-[30%] px-4 py-2 text-gray-600 border-2 rounded-full focus:outline-none"
          />
        </div> */}

        {/* Table Section */}
        <div className="table-section mt-6 overflow-x-auto">
          <EventgroupsSuperadminTable data={searchResults.length > 0 ? searchResults : events} />
        </div>
      </div>

      {/* Add Event Group Drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={toggleDrawer}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#F0F3F5] p-5 md:p-10 rounded-t-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex justify-center items-center mb-8">
              <h2 className="text-xl font-semibold">Add Event Group</h2>
              <button
                onClick={toggleDrawer}
                className="absolute right-0 text-gray-600 hover:text-gray-800 text-[1.5rem]"
              >
                <FaTimes />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleAddEventGroup({
                  eventGroupName: formData.get('eventGroupName'),
                  ownerName: formData.get('ownerName'),
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                });
              }}
              className="w-full flex flex-col items-center justify-center"
            >
              <div className="w-full max-w-6xl px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16">
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