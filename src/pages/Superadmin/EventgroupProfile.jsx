import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { RxPerson } from 'react-icons/rx';
import TableComponent from '../../Components/Superadmin/EventgroupsSuperadminTable';
import axiosInstance from '../../axiosConfig';
import EventgroupEventsList from '../../Components/Superadmin/EventgroupEventsList';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEventGroupById,
  updateEventGroup,
} from '../../Redux/Slices/SuperAdmin/EventgroupssuperadminSlice';

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

  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });

  const [formErrors, setFormErrors] = useState({
    eventName: '',
    startDate: '',
    endDate: '',
    amount: '',
  });

  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const dispatch = useDispatch();
  const {
    currentEventGroup,
    loading: reduxLoading,
    updateLoading,
    error: reduxError,
    updateError,
  } = useSelector((state) => state.eventGroups);

  const [editFormErrors, setEditFormErrors] = useState({});

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        console.error('No event group ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        await dispatch(fetchEventGroupById(id)).unwrap();
      } catch (error) {
        console.error('Error fetching event group:', error);
        setNotification({
          show: true,
          type: 'error',
          message: 'Failed to load event group details. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, dispatch]);

  useEffect(() => {
    if (currentEventGroup) {
      setBasicInfo({
        eventGroupName: currentEventGroup.company_name || '',
        ownerName: currentEventGroup.owner_name || '',
        id: currentEventGroup.id || '',
      });
      setContactInfo({
        email: currentEventGroup.email || '',
        phone: currentEventGroup.phone || '',
        address: currentEventGroup.address || '',
      });
    }
  }, [currentEventGroup]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);

  const openEditModal = (section) => {
    setEditSection(section);
    if (section === 'basic-info') {
      setTempData({
        eventGroupName: basicInfo.eventGroupName || '',
        ownerName: basicInfo.ownerName || '',
      });
    } else if (section === 'contact-info') {
      setTempData({
        email: contactInfo.email || '',
        phone: contactInfo.phone || '',
        // address: contactInfo.address || ''
      });
    }
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'ownerName') {
      const noNumbers = value.replace(/[0-9]/g, '');
      setTempData((prev) => ({
        ...prev,
        [name]: noNumbers,
      }));
    } else if (name === 'phone') {
      const numbersOnly = value.replace(/\D/g, '').slice(0, 10); // Only allow numbers, max 10 digits
      setTempData((prev) => ({
        ...prev,
        [name]: numbersOnly,
      }));
    } else {
      setTempData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateEditFields = (section, data) => {
    const errors = {};

    if (section === 'basic-info') {
      if (!data.eventGroupName?.trim()) {
        errors.eventGroupName = 'Event Group Name is required';
      } else if (data.eventGroupName.length < 2) {
        errors.eventGroupName =
          'Event Group Name must be at least 2 characters';
      }

      if (!data.ownerName?.trim()) {
        errors.ownerName = 'Owner Name is required';
      } else if (data.ownerName.length < 2) {
        errors.ownerName = 'Owner Name must be at least 2 characters';
      } else if (/\d/.test(data.ownerName)) {
        errors.ownerName = 'Owner Name cannot contain numbers';
      }
    } else if (section === 'contact-info') {
      if (!data.email?.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid email address';
      }

      if (!data.phone?.trim()) {
        errors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    return errors;
  };

  const saveChanges = async () => {
    const eventId = basicInfo.id;

    if (!eventId) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Unable to identify the event group. Please try again.',
      });
      return;
    }

    try {
      setIsSaving(true);
      let changedFields = {
        id: eventId,
      };

      if (editSection === 'basic-info') {
        changedFields = {
          ...changedFields,
          company_name: tempData.eventGroupName,
          owner_name: tempData.ownerName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          address: contactInfo.address,
        };
      } else if (editSection === 'contact-info') {
        changedFields = {
          ...changedFields,
          email: tempData.email,
          phone: tempData.phone,
          address: tempData.address,
          company_name: basicInfo.eventGroupName,
          owner_name: basicInfo.ownerName,
        };
      }

      // Validate fields before saving
      const validationErrors = validateEditFields(editSection, tempData);
      setEditFormErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      // Update through Redux and get the response
      const updatedData = await dispatch(
        updateEventGroup({ id: eventId, data: changedFields })
      ).unwrap();

      // Update local state
      if (editSection === 'basic-info') {
        setBasicInfo((prev) => ({
          ...prev,
          eventGroupName: tempData.eventGroupName,
          ownerName: tempData.ownerName,
        }));
      } else if (editSection === 'contact-info') {
        setContactInfo((prev) => ({
          ...prev,
          email: tempData.email,
          phone: tempData.phone,
          address: tempData.address,
        }));
      }

      // Update Redux state directly instead of fetching
      dispatch({
        type: 'eventGroups/setCurrentEventGroup',
        payload: {
          ...currentEventGroup,
          ...changedFields,
        },
      });

      setModalOpen(false);
      setNotification({
        show: true,
        type: 'success',
        message: 'Changes have been saved successfully!',
      });
    } catch (err) {
      console.error('Update error:', err);
      setNotification({
        show: true,
        type: 'error',
        message: err.message || 'Unable to save changes. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.eventName.trim()) {
      errors.eventName = 'Event Name is required';
    } else if (data.eventName.length < 2) {
      errors.eventName = 'Event Name must be at least 2 characters';
    }

    if (!data.startDate) {
      errors.startDate = 'Start Date is required';
    }

    if (!data.endDate) {
      errors.endDate = 'End Date is required';
    } else if (new Date(data.endDate) < new Date(data.startDate)) {
      errors.endDate = 'End Date cannot be before Start Date';
    }

    if (!data.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(data.amount) || Number(data.amount) <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }

    return errors;
  };

  const handleAddEvent = async (eventData) => {
    const validationErrors = validateForm(eventData);
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsAddingEvent(true);

      const payload = {
        event_group: basicInfo.id,
        event_name: eventData.eventName,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        total_amount: eventData.amount.toString(),
      };

      const response = await axiosInstance.post('register-events/', payload);

      if (response.status === 200 || response.status === 201) {
        await dispatch(fetchEventGroupById(basicInfo.id));

        setNotification({
          show: true,
          type: 'success',
          message: 'Event has been successfully added!',
        });
        setDrawerOpen(false);
      }
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Unable to add event. Please check all fields and try again.',
      });
      setDrawerOpen(false);
    } finally {
      setIsAddingEvent(false);
    }
  };

  if (reduxLoading || isLoading)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );

  if (reduxError)
    return (
      <div className="w-full p-4 bg-red-500 border border-red-200 rounded-lg">
        <p className="text-red-500 text-center">{reduxError}</p>
        <button
          onClick={() => navigate('/event-groups')}
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md mx-auto block"
        >
          Back to Event Groups
        </button>
      </div>
    );

  return (
    <div className="flex min-h-screen px-3 sm:px-10 pb-10 mt-10">
      <Notification
        notification={notification}
        setNotification={setNotification}
      />
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 min-h-full w-64 bg-white z-10 transform border-r-2 border-grey-200 pt-20 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex flex-col lg:w-64 p-4`}
      >
        <button
          onClick={toggleSidebar}
          className="lg:hidden absolute top-4 right-4 text-gray-600"
        >
          <FaTimes size={24} />
        </button>

        <div className="flex flex-col items-center">
          <img
            className="w-20 h-20 rounded-full"
            src="/profile-avatar.png"
            alt="Profile"
          />
          <h2 className="mt-4 text-lg font-semibold text-center break-words w-full px-2">
            {basicInfo.eventGroupName}
          </h2>
          <p className="text-sm text-gray-500 break-words w-full text-center px-2">
            {contactInfo.email}
          </p>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => {
              setActiveSection('personal-info');
              setSidebarOpen(false);
            }}
            className={`flex items-center p-2 rounded-md w-full text-left ${
              activeSection === 'personal-info'
                ? 'bg-[#98FFE0] text-black border-b-2 border-black'
                : 'text-gray-600'
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
              activeSection === 'notifications'
                ? 'bg-[#98FFE0] text-black border-b-2 border-black'
                : 'text-gray-600'
            }`}
          >
            <RxPerson />
            <span className="ml-4">Events</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 md:p-8 overflow-x-hidden w-[900px] bg-white min-h-screen">
        <div className="flex items-start sm:items-center justify-between flex-col  sm:flex-row  mb-6">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-gray-600 focus:outline-none"
          >
            <FaBars size={24} />
          </button>
          <button
            onClick={() => navigate('/superadmin/eventgroups')}
            className="px-4 py-2 text-white bg-black rounded-full flex items-center sm:mt-8 mt-4"
          >
            <span className="mr-2">←</span> Back to Event Groups
          </button>
        </div>

        {activeSection === 'personal-info' && (
          <div className="bg-white p-6 rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">Basic Info</h1>
            <hr className="w-full border mb-5" />
            <div className="flex flex-col xl:flex-row items-start justify-between">
              <div className="grid grid-cols-1 gap-4 mt-2">
                <div className="flex flex-col xl:flex-row">
                  <p className="text-gray-500 w-52">Event Group Name</p>
                  <p>{basicInfo.eventGroupName}</p>
                </div>
                <div className="flex flex-col xl:flex-row">
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
              <hr className="w-full border mb-5" />
              <div className="edit-fields flex flex-col xl:flex-row items-start justify-between">
                <div className="grid grid-cols-1 gap-4 mt-2">
                  <div className="flex flex-col xl:flex-row">
                    <p className="text-gray-500 w-52">E-mail</p>
                    <p className="break-words">{contactInfo.email}</p>
                  </div>
                  <div className="flex flex-col xl:flex-row">
                    <p className="text-gray-500 w-52">Phone</p>
                    <p>{contactInfo.phone}</p>
                  </div>
                  {/* <div className="flex flex-col xl:flex-row">
                    <p className="text-gray-500 w-52">Address</p>
                    <p>{contactInfo.address}</p>
                  </div> */}
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
                className="px-4 py-2 bg-[#2D3436] text-white rounded hover:bg-[#1a1f20] transition-colors duration-200"
              >
                + Add Events
              </button>
            </div>
            <EventgroupEventsList eventGroupId={basicInfo.id} />
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Edit{' '}
                  {editSection === 'basic-info' ? 'Basic Info' : 'Contact Info'}
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
                        className={`w-full border p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          editFormErrors.eventGroupName ? 'border-red-500' : ''
                        }`}
                      />
                      {editFormErrors.eventGroupName && (
                        <p className="text-red-500 text-sm mt-1">
                          {editFormErrors.eventGroupName}
                        </p>
                      )}
                    </label>
                    <label className="block mb-4">
                      <span className="text-gray-700">Owner's Name</span>
                      <input
                        type="text"
                        name="ownerName"
                        value={tempData.ownerName || ''}
                        onChange={handleInputChange}
                        className={`w-full border p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          editFormErrors.ownerName ? 'border-red-500' : ''
                        }`}
                      />
                      {editFormErrors.ownerName && (
                        <p className="text-red-500 text-sm mt-1">
                          {editFormErrors.ownerName}
                        </p>
                      )}
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
                        className={`w-full border p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          editFormErrors.email ? 'border-red-500' : ''
                        }`}
                      />
                      {editFormErrors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {editFormErrors.email}
                        </p>
                      )}
                    </label>
                    <label className="block mb-4">
                      <span className="text-gray-700">Phone</span>
                      <input
                        type="text"
                        name="phone"
                        value={tempData.phone || ''}
                        onChange={handleInputChange}
                        className={`w-full border p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          editFormErrors.phone ? 'border-red-500' : ''
                        }`}
                      />
                      {editFormErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {editFormErrors.phone}
                        </p>
                      )}
                    </label>
                  </>
                )}
              </form>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  disabled={isSaving}
                  className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={toggleDrawer}
          >
            <div
              className="absolute bottom-0 left-0 right-0 bg-[#F0F3F5] p-6 rounded-t-lg shadow-lg transform transition-transform duration-300 z-[10]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="title-sec w-full mt-10">
                  <h2 className="text-3xl font-semibold text-center">
                    Add Event
                  </h2>
                </div>
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
                    amount: formData.get('amount'),
                  });
                }}
                className="w-full flex flex-col items-center justify-center px-3"
              >
                <div className="w-full max-w-2xl">
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    {formErrors.eventName && (
                      <div className="text-red-500 text-sm mb-1">
                        {formErrors.eventName}
                      </div>
                    )}
                    <input
                      type="text"
                      name="eventName"
                      className="w-full border p-2 rounded-3xl pl-6 pr-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter event name"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    {formErrors.startDate && (
                      <div className="text-red-500 text-sm mb-1">
                        {formErrors.startDate}
                      </div>
                    )}
                    <input
                      type="date"
                      name="startDate"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border p-2 rounded-3xl pl-6 pr-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    {formErrors.endDate && (
                      <div className="text-red-500 text-sm mb-1">
                        {formErrors.endDate}
                      </div>
                    )}
                    <input
                      type="date"
                      name="endDate"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border p-2 rounded-3xl pl-6 pr-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    {formErrors.amount && (
                      <div className="text-red-500 text-sm mb-1">
                        {formErrors.amount}
                      </div>
                    )}
                    <input
                      type="number"
                      name="amount"
                      className="w-full border p-2 rounded-3xl pl-6 pr-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={isAddingEvent}
                      className="bg-black text-white px-10 py-2 rounded hover:bg-gray-800 transition-colors duration-200"
                    >
                      {isAddingEvent ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          <span>Adding...</span>
                        </div>
                      ) : (
                        'Add Event'
                      )}
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

const Notification = ({ notification, setNotification }) => {
  if (!notification.show) return null;

  const getIcon = () => {
    if (notification.type === 'success') {
      return (
        <div className="w-12 h-12 rounded-full bg-green-100 p-2 flex items-center justify-center mx-auto mb-4 z-[100]">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-red-100 p-2 flex items-center justify-center mx-auto mb-4 z-[1000]">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all animate-modal-enter">
        <div className="p-6">
          <button
            onClick={() =>
              setNotification({ show: false, type: '', message: '' })
            }
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {getIcon()}

          <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
            {notification.type === 'success' ? 'Success!' : 'Oops!'}
          </h3>

          <p className="text-center text-gray-600 mb-6">
            {notification.message}
          </p>

          <button
            onClick={() =>
              setNotification({ show: false, type: '', message: '' })
            }
            className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all duration-200 ${
              notification.type === 'success'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {notification.type === 'success' ? 'Continue' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventgroupProfile;
