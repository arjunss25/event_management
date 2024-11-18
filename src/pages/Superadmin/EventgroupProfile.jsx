import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { RxPerson } from "react-icons/rx";
import TableComponent from '../../Components/Superadmin/EventgroupsSuperadminTable';
import axiosInstance from '../../axiosConfig';
import EventgroupEventsList from '../../Components/Superadmin/EventgroupEventsList';

const EventgroupProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const eventData = location.state?.eventData;

  const [activeSection, setActiveSection] = useState('personal-info');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [editSection, setEditSection] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [basicInfo, setBasicInfo] = useState({
    eventGroupName: '',
    ownerName: '',
    id: '',
  });

  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
  });

  const [tempData, setTempData] = useState({});

  useEffect(() => {
    if (eventData) {
      setBasicInfo({
        eventGroupName: eventData.company_name || '',
        ownerName: eventData.owner_name || '',
        id: eventData.id || '',
      });
      setContactInfo({
        email: eventData.email || '',
        phone: eventData.phone || '',
        address: eventData.address || '',
      });
      setIsLoading(false);
    } else {
      // If no event data in location state, fetch it using the ID
      fetchEventData();
    }
  }, [eventData, id]);

  const fetchEventData = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API call
      const response = await fetch(`/api/event-groups/${id}`);
      if (!response.ok) throw new Error('Failed to fetch event data');
      const data = await response.json();

      setBasicInfo({
        eventGroupName: data.eventGroup,
        ownerName: data.ownerName,
      });
      setContactInfo({
        email: data.email,
        phone: data.phone,
        address: data.address,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);

  const openEditModal = (section) => {
    setEditSection(section);
    setTempData(section === 'basic-info' ? { ...basicInfo } : { ...contactInfo });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData((prevData) => ({ ...prevData, [name]: value }));
  };

  

  const saveChanges = async () => {
    const eventId = eventData?.id || id;
    
    if (!eventId) {
      alert('Error: Event Group ID is missing!');
      return;
    }
  
    try {
      // Create an object to store only the changed fields
      let changedFields = {};
      
      if (editSection === 'basic-info') {
        // Compare basic info fields with original data
        if (tempData.eventGroupName !== basicInfo.eventGroupName) {
          changedFields.company_name = tempData.eventGroupName;
        }
        if (tempData.ownerName !== basicInfo.ownerName) {
          changedFields.owner_name = tempData.ownerName;
        }
      } else if (editSection === 'contact-info') {
        // Compare contact info fields with original data
        if (tempData.email !== contactInfo.email) {
          changedFields.email = tempData.email;
        }
        if (tempData.phone !== contactInfo.phone) {
          changedFields.phone = tempData.phone;
        }
        if (tempData.address !== contactInfo.address) {
          changedFields.address = tempData.address;
        }
      }
  
      // If no fields have changed, return early
      if (Object.keys(changedFields).length === 0) {
        alert('No changes detected');
        setModalOpen(false);
        return;
      }
  
      // Add ID to the payload
      changedFields.id = eventId;
  
      // Make the API call with only the changed fields
      const response = await axiosInstance.put(`/list-eventgroup-by-id/${eventId}/`, changedFields);
  
      if (response.status === 200) {
        // Update the local state based on which section was edited
        if (editSection === 'basic-info') {
          setBasicInfo(prev => ({
            ...prev,
            eventGroupName: tempData.eventGroupName || prev.eventGroupName,
            ownerName: tempData.ownerName || prev.ownerName,
          }));
        } else if (editSection === 'contact-info') {
          setContactInfo(prev => ({
            ...prev,
            email: tempData.email || prev.email,
            phone: tempData.phone || prev.phone,
            address: tempData.address || prev.address,
          }));
        }
  
        setModalOpen(false);
        alert('Changes saved successfully!');
      }
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // More specific error messages based on the error type
      if (err.response?.status === 404) {
        alert('Error: The event group could not be found. Please check the ID and try again.');
      } else if (err.response?.status === 400) {
        alert('Error: Invalid data provided. Please check your input and try again.');
      } else {
        alert('Failed to save changes: ' + (err.response?.data?.message || err.message));
      }
    }
  };
  const handleAddEvent = async (eventData) => {
    try {
      // Log incoming data
      console.log('Received event data:', eventData);
      console.log('Current event group ID:', basicInfo.id);

      const payload = {
        event_group: basicInfo.id, // Convert ID to string if needed
        event_name: eventData.eventName,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        total_amount: eventData.amount.toString() // Convert amount to string
      };

      // Log the formatted payload
      console.log('Sending payload:', payload);

      // Log the full request details
      console.log('Making request to:', 'register-events/');
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        ...axiosInstance.defaults.headers
      });

      // Make the API call to register the event
      const response = await axiosInstance.post('register-events/', payload);

      // Log successful response
      console.log('Response received:', response);

      if (response.status === 200 || response.status === 201) {
        console.log('Event added successfully:', response.data);
        alert('Event added successfully!');
        toggleDrawer(); // Close the drawer
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (err) {
      // Detailed error logging
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        config: err.config
      });

      // Check for specific error conditions
      if (err.response?.status === 400) {
        console.error('Bad request error:', err.response.data);
        alert('Invalid data provided: ' + JSON.stringify(err.response.data));
      } else if (err.response?.status === 401) {
        console.error('Authentication error');
        alert('Authentication error. Please log in again.');
      } else if (err.response?.status === 404) {
        console.error('Endpoint not found');
        alert('API endpoint not found. Please check the URL.');
      } else {
        console.error('Unexpected error:', err);
        alert('Failed to add event: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (isLoading) return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-500 text-center">{error}</p>
      <button 
        onClick={() => navigate('/event-groups')}
        className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md mx-auto block"
      >
        Back to Event Groups
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white z-10 transform border-r-2 border-grey-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex flex-col lg:w-64 p-4`}
      >
        <button onClick={toggleSidebar} className="lg:hidden absolute top-4 right-4 text-gray-600">
          <FaTimes size={24} />
        </button>

        <div className="flex flex-col items-center">
          <img
            className="w-20 h-20 rounded-full border-2 border-black"
            src="/profile_pic.svg"
            alt="Profile"
          />
          <h2 className="mt-4 text-lg font-semibold">{basicInfo.eventGroupName}</h2>
          <p className="text-sm text-gray-500">{contactInfo.email}</p>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => {
              setActiveSection('personal-info');
              setSidebarOpen(false);
            }}
            className={`flex items-center p-2 rounded-md w-full text-left ${
              activeSection === 'personal-info' ? 'bg-[#98FFE0] text-black border-b-2 border-black' : 'text-gray-600'
            }`}
          >
            <RxPerson />
            <span className="ml-4">Basic Info</span>
          </button>
          <button
            onClick={() => {
              setActiveSection('notifications');
              setSidebarOpen(false);
            }}
            className={`flex items-center p-2 rounded-md w-full text-left ${
              activeSection === 'notifications' ? 'bg-[#98FFE0] text-black border-b-2 border-black' : 'text-gray-600'
            }`}
          >
            <RxPerson />
            <span className="ml-4">Events</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-x-hidden w-[900px]">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-gray-600 focus:outline-none"
          >
            <FaBars size={24} />
          </button>
          <button 
            onClick={() => navigate('/superadmin/eventgroups')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
          >
            <span  className="mr-2">←</span> Back to Event Groups
          </button>
        </div>

        {activeSection === 'personal-info' && (
          <div className="bg-white p-6 rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">Basic Info</h1>
            <hr className='w-full border mb-5' />
            <div className="flex flex-col xl:flex-row items-start justify-between">
              <div className="grid grid-cols-1 gap-4 mt-2">
                <div className='flex flex-col xl:flex-row'>
                  <p className="text-gray-500 w-52">Event Group Name</p>
                  <p>{basicInfo.eventGroupName}</p>
                </div>
                <div className='flex flex-col xl:flex-row'>
                  <p className="text-gray-500 w-52">Owner's Name</p>
                  <p>{basicInfo.ownerName}</p>
                </div>
              </div>
              <button
                className="mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
                onClick={() => openEditModal('basic-info')}
              >
                Edit
              </button>
            </div>
            <section className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Contact Info</h2>
              <hr className='w-full border mb-5' />
              <div className="edit-fields flex flex-col xl:flex-row items-start justify-between">
                <div className="grid grid-cols-1 gap-4 mt-2">
                  <div className='flex flex-col xl:flex-row'>
                    <p className="text-gray-500 w-52">E-mail</p>
                    <p>{contactInfo.email}</p>
                  </div>
                  <div className='flex flex-col xl:flex-row'>
                    <p className="text-gray-500 w-52">Phone</p>
                    <p>{contactInfo.phone}</p>
                  </div>
                  <div className='flex flex-col xl:flex-row'>
                    <p className="text-gray-500 w-52">Address</p>
                    <p>{contactInfo.address}</p>
                  </div>
                </div>
                <button
                  className="mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
                  onClick={() => openEditModal('contact-info')}
                >
                  Edit
                </button>
              </div>
            </section>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="bg-white rounded-lg">
            <div className="flex justify-end mb-4">
              <button 
                onClick={toggleDrawer} 
                className='px-4 py-2 bg-[#2D3436] text-white rounded hover:bg-[#1a1f20] transition-colors duration-200'
              >
                + Add Events
              </button>
            </div>
            <EventgroupEventsList/>
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Edit {editSection === 'basic-info' ? 'Basic Info' : 'Contact Info'}
                </h2>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={(e) => e.preventDefault()}>
                {editSection === 'basic-info' ? (
                  <>
                    <label className="block mb-4">
                      <span className="text-gray-700">Event Group Name</span>
                      <input
                        type="text"
                        name="eventGroupName"
                        value={tempData.eventGroupName || ''}
                        onChange={handleInputChange}
                        className="w-full border p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </label>
                    <label className="block mb-4">
                      <span className="text-gray-700">Owner's Name</span>
                      <input
                        type="text"
                        name="ownerName"
                        value={tempData.ownerName || ''}
                        onChange={handleInputChange}
                        className="w-full border p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="block mb-4">
                      <span className="text-gray-700">E-mail</span>
                      <input
                        type="email"
                        name="email"
                        value={tempData.email || ''}
                        onChange={handleInputChange}
                        className="w-full border p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </label>
                    <label className="block mb-4">
                      <span className="text-gray-700">Phone</span>
                      <input
                        type="text"
                        name="phone"
                        value={tempData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full border p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </label>
                    <label className="block mb-4">
                      <span className="text-gray-700">Address</span>
                      <input
                        type="text"
                        name="address"
                        value={tempData.address || ''}
                        onChange={handleInputChange}
                        className="w-full border p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </label>
                  </>
                )}
              </form>
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveChanges}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Event Drawer */}
 {/* Add Event Drawer */}
 {isDrawerOpen && (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      onClick={toggleDrawer}
    >
      <div 
        className="absolute bottom-0 left-0 right-0 bg-[#F0F3F5] p-6 rounded-t-lg shadow-lg transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Event</h2>
          <button 
            onClick={toggleDrawer}
            className="text-gray-600 hover:text-gray-800 text-[1.5rem]"
          >
            <FaTimes />
          </button>
        </div>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleAddEvent({
              eventName: formData.get('eventName'),
              startDate: formData.get('startDate'),
              endDate: formData.get('endDate'),
              amount: formData.get('amount')
            });
          }}
          className="w-full flex flex-col items-center justify-center px-3"
        >
          <div className="w-full max-w-2xl">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Event Name</label>
              <input 
                type="text" 
                name="eventName"
                className="w-full border p-2 rounded-3xl pl-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter event name"
                required 
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Start Date</label>
              <input 
                type="date" 
                name="startDate"
                className="w-full border p-2 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">End Date</label>
              <input 
                type="date" 
                name="endDate"
                className="w-full border p-2 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Amount</label>
              <input 
                type="number" 
                name="amount"
                className="w-full border p-2 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                required
              />
            </div>
            <div className="flex justify-center">
              <button 
                type="submit"
                className="bg-black text-white px-10 py-2 rounded hover:bg-gray-800 transition-colors duration-200"
              >
                Add Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )}
      </div>
    </div>
  );
};

export default EventgroupProfile;
