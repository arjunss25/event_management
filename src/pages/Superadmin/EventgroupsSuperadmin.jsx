import React, { useState, useEffect } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import { FaTimes } from 'react-icons/fa';
import EventgroupsSuperadminTable from '../../Components/Superadmin/EventgroupsSuperadminTable';
import axiosInstance from '../../axiosConfig';
import { tokenService } from '../../tokenService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';

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

  const [formErrors, setFormErrors] = useState({
    eventGroupName: '',
    ownerName: '',
    email: '',
    phone: '',
  });

  const validateForm = (data) => {
    const errors = {};

    if (!data.eventGroupName.trim()) {
      errors.eventGroupName = 'Event Group Name is required';
    } else if (data.eventGroupName.length < 2) {
      errors.eventGroupName = 'Event Group Name must be at least 2 characters';
    }

    if (!data.ownerName.trim()) {
      errors.ownerName = 'Owner Name is required';
    } else if (data.ownerName.length < 2) {
      errors.ownerName = 'Owner Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^\d{10}$/;
    if (!data.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(data.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    return errors;
  };

  useEffect(() => {
    const token = tokenService.getAccessToken();
    const fbToken = tokenService.getFirebaseToken();
    const role = tokenService.getUserRole();

    if (token && role) {
      setAccessToken(token);
      setFirebaseToken(fbToken);
      setUserRole(role);
    }
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
    setError(null); // Clear any existing errors
  };

  const handleAddEventGroup = async (eventGroupData) => {
    const validationErrors = validateForm(eventGroupData);
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First create Firebase user

      const defaultPassword = `${eventGroupData.eventGroupName
        .replace(/\s+/g, '')
        .toLowerCase()}@123`;

      let firebaseUser;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          eventGroupData.email,
          defaultPassword
        );
        firebaseUser = userCredential.user;
      } catch (firebaseError) {


        // Handle specific Firebase errors
        if (firebaseError.code === 'auth/email-already-in-use') {
          throw new Error('An account with this email already exists.');
        } else if (firebaseError.code === 'auth/invalid-email') {
          throw new Error('The email address is not valid.');
        } else if (firebaseError.code === 'auth/operation-not-allowed') {
          throw new Error(
            'Email/password accounts are not enabled. Please contact support.'
          );
        } else if (firebaseError.code === 'auth/weak-password') {
          throw new Error('The password is too weak.');
        }
        throw firebaseError;
      }

      const requestData = {
        company_name: eventGroupData.eventGroupName,
        owner_name: eventGroupData.ownerName,
        email: eventGroupData.email,
        phone: eventGroupData.phone,
        firebase_uid: firebaseUser.uid, 
      };


      const response = await axiosInstance.post(
        '/register-eventgroup/',
        requestData
      );


      if (response.status === 200 || response.status === 201) {
        alert(
          `Event group added successfully! Default password is: ${defaultPassword}`
        );
        toggleDrawer();
      } else {
        // If backend registration fails, delete the Firebase user
        if (firebaseUser) {
          try {
            await firebaseUser.delete();
          } catch (deleteError) {
          }
        }
        throw new Error(
          response.data?.message || 'Failed to register event group'
        );
      }
    } catch (err) {


      let errorMessage = 'Failed to add event group';

      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage =
              err.response.data?.message || 'Invalid data provided';
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
            errorMessage =
              'Service endpoint not found. Please contact support.';
            break;
          case 422:
            errorMessage =
              err.response.data?.message || 'Invalid event group data';
            break;
          default:
            errorMessage =
              err.response.data?.message || 'An unexpected error occurred';
        }
      } else if (err.request) {
        errorMessage =
          'Unable to reach the server. Please check your connection.';
      } else {
        errorMessage = err.message;
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

      if (response.status === 200) {
        setSearchResults(response.data?.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {

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
          <EventgroupsSuperadminTable
            data={searchResults.length > 0 ? searchResults : events}
          />
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
              <h2 className="text-[1.5rem] sm:text-[2rem] font-semibold">
                Add Event Group
              </h2>
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
                    <label className="block text-gray-700 mb-2">
                      Event Group Name
                    </label>
                    {formErrors.eventGroupName && (
                      <div className="text-red-500 text-sm mb-1">
                        {formErrors.eventGroupName}
                      </div>
                    )}
                    <input
                      type="text"
                      name="eventGroupName"
                      className="w-full border p-2 rounded-3xl pl-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter event group name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Owner's Name
                    </label>
                    {formErrors.ownerName && (
                      <div className="text-red-500 text-sm mb-1">
                        {formErrors.ownerName}
                      </div>
                    )}
                    <input
                      type="text"
                      name="ownerName"
                      className="w-full border p-2 rounded-3xl pl-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter owner's name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    {formErrors.email && (
                      <div className="text-red-500 text-sm mb-1">
                        {formErrors.email}
                      </div>
                    )}
                    <input
                      type="email"
                      name="email"
                      className="w-full border p-2 rounded-3xl pl-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    {formErrors.phone && (
                      <div className="text-red-500 text-sm mb-1">
                        {formErrors.phone}
                      </div>
                    )}
                    <input
                      type="tel"
                      name="phone"
                      className="w-full border p-2 rounded-3xl pl-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
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
