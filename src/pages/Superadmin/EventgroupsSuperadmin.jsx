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

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationContent, setNotificationContent] = useState({
    message: '',
    type: '', // 'success' or 'error'
  });

  const validateForm = (data) => {
    const errors = {};

    if (!data.eventGroupName.trim()) {
      errors.eventGroupName = 'Event Group Name is required';
    } else if (data.eventGroupName.length < 2) {
      errors.eventGroupName = 'Event Group Name must be at least 2 characters';
    }

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!data.ownerName.trim()) {
      errors.ownerName = 'Owner Name is required';
    } else if (data.ownerName.length < 2) {
      errors.ownerName = 'Owner Name must be at least 2 characters';
    } else if (!nameRegex.test(data.ownerName)) {
      errors.ownerName = 'Owner Name should only contain letters and spaces';
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    } else if (data.email.length > 254) {
      errors.email = 'Email address is too long';
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
    setError(null);
  };

  const handleAddEventGroup = async (eventGroupData) => {
    const validationErrors = validateForm(eventGroupData);
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      let firebaseUser;
      try {
        // Generate a random password for the user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          eventGroupData.email,
          Math.random().toString(36).slice(-8) // Random password that won't be shown to user
        );
        firebaseUser = userCredential.user;
      } catch (firebaseError) {
        let errorMessage = 'Failed to create user account';
        if (firebaseError.code === 'auth/email-already-in-use') {
          errorMessage = 'An account with this email already exists.';
        }
        setNotificationContent({
          message: errorMessage,
          type: 'error',
        });
        setShowNotificationModal(true);
        throw new Error(errorMessage);
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
        setNotificationContent({
          message: 'Event group added successfully!',
          type: 'success',
        });
        setShowNotificationModal(true);
        toggleDrawer();
      }
    } catch (err) {
      if (firebaseUser) {
        try {
          await firebaseUser.delete();
        } catch (deleteError) {}
      }

      setNotificationContent({
        message: 'Unable to add event group. Please try again later.',
        type: 'error',
      });
      setShowNotificationModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (name) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        `/search-eventgroup-name/${name}`
      );

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
            >
              <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16">
                  <div className="text-center">
                    <label className="block text-gray-700 mb-2 text-left">
                      Event Group Name
                    </label>
                    <div className="h-[60px]">
                      {formErrors.eventGroupName && (
                        <div className="text-red-500 text-sm mb-1 text-left">
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
                  </div>

                  <div className="text-center">
                    <label className="block text-gray-700 mb-2 text-left">
                      Owner's Name
                    </label>
                    <div className="h-[60px]">
                      {formErrors.ownerName && (
                        <div className="text-red-500 text-sm mb-1 text-left">
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
                  </div>

                  <div className="text-center">
                    <label className="block text-gray-700 mb-2 text-left">
                      Email
                    </label>
                    <div className="h-[60px]">
                      {formErrors.email && (
                        <div className="text-red-500 text-sm mb-1 text-left">
                          {formErrors.email}
                        </div>
                      )}
                      <input
                        type="text"
                        name="email"
                        className="w-full border p-2 rounded-3xl pl-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <label className="block text-gray-700 mb-2 text-left">
                      Phone
                    </label>
                    <div className="h-[60px]">
                      {formErrors.phone && (
                        <div className="text-red-500 text-sm mb-1 text-left">
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
                </div>

                <div className="flex justify-center mt-10">
                  <button
                    type="submit"
                    className="bg-black text-white px-10 py-2 rounded hover:bg-gray-800 transition-colors duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        <span>Adding...</span>
                      </div>
                    ) : (
                      'Add Event Group'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-[90%] md:w-[400px] transform transition-all">
            <div className="mb-6">
              <div
                className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                  notificationContent.type === 'success'
                    ? 'bg-green-100'
                    : 'bg-red-100'
                }`}
              >
                {notificationContent.type === 'success' ? (
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                )}
              </div>
            </div>
            <h3
              className={`text-2xl font-bold text-center mb-4 ${
                notificationContent.type === 'success'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {notificationContent.type === 'success' ? 'Success!' : 'Error!'}
            </h3>
            <p className="text-gray-500 text-center mb-8">
              {notificationContent.message}
            </p>
            <div className="flex justify-center">
              <button
                className={`px-6 py-3 rounded-lg font-medium text-white ${
                  notificationContent.type === 'success'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                } transition-colors`}
                onClick={() => setShowNotificationModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventgroupsSuperadmin;
