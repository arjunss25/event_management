import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEventDetails, updateEventDetails } from '../../Redux/Slices/Admin/AdminEventSlice';
import UserRegistration from './UserRegistration';
import AdminEmployeeAllocation from './AdminEmployeeAllocation';
import AdminEventFood from './AdminEventFood';
import { FaBars, FaTimes } from 'react-icons/fa';

const AdminEventDetails = () => {
  const dispatch = useDispatch();
  const { selectedEvent, loading, error } = useSelector((state) => state.adminEvents);
  const [activeTab, setActiveTab] = useState('eventDetails');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    venue: '',
    seatsAllocated: '',
    paymentStatus: '',
    totalAmount: ''
  });

  useEffect(() => {
    dispatch(fetchEventDetails());
  }, [dispatch]);

  useEffect(() => {
    if (selectedEvent) {
      setFormData({
        venue: selectedEvent.venue || '',
        seatsAllocated: selectedEvent.seatsBooked?.toString() || '',
        paymentStatus: selectedEvent.paymentStatus || '',
        totalAmount: selectedEvent.totalAmount || ''
      });
    }
  }, [selectedEvent]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleEditModal = () => {
    setIsEditModalOpen(prev => !prev);
    if (isEditModalOpen) {
      setFormData({
        venue: selectedEvent?.venue || '',
        seatsAllocated: selectedEvent?.seatsBooked?.toString() || '',
        paymentStatus: selectedEvent?.paymentStatus || '',
        totalAmount: selectedEvent?.totalAmount || ''
      });
    }
  };

  const handleNext = () => {
    if (activeTab === 'eventDetails') {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const handlePrevious = () => {
    if (activeTab === 'eventDetails') {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    dispatch(updateEventDetails({
      venue: formData.venue,
      seatsBooked: parseInt(formData.seatsAllocated)
    })).then(() => {
      setIsEditModalOpen(false);
      setCurrentStep(0);
      dispatch(fetchEventDetails());
    });
  };

  const renderEventDetailsContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="bg-white p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">General Details</h2>
            <hr className="w-full border-gray-200 mb-6" />
            <div className="grid grid-cols-1 gap-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col">
                    <p className="text-gray-500 text-sm mb-1">Event</p>
                    <p className="text-lg font-semibold">{selectedEvent?.eventName || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col">
                    <p className="text-gray-500 text-sm mb-1">Start Date</p>
                    <p className="text-lg font-semibold">
                      {selectedEvent?.startDate ? new Date(selectedEvent.startDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col">
                    <p className="text-gray-500 text-sm mb-1">End Date</p>
                    <p className="text-lg font-semibold">
                      {selectedEvent?.endDate ? new Date(selectedEvent.endDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col">
                    <p className="text-gray-500 text-sm mb-1">Payment Status</p>
                    <p className={`text-lg font-semibold ${
                      selectedEvent?.paymentStatus === 'Completed' 
                        ? 'text-emerald-500' 
                        : selectedEvent?.paymentStatus === 'Pending'
                        ? 'text-amber-500'
                        : 'text-red-500'
                    }`}>
                      {selectedEvent?.paymentStatus || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col">
                    <p className="text-gray-500 text-sm mb-1">Total Amount</p>
                    <p className="text-lg font-semibold">
                      ₹{selectedEvent?.totalAmount?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-800">Additional Info</h2>
              <hr className="w-full border-gray-200 mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium mb-2">Venue</label>
                  <textarea
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    placeholder="Enter venue details"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    rows="4"
                    readOnly={!isEditModalOpen}
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium mb-2">Seats Allocated</label>
                  <input
                    type="text"
                    name="seatsAllocated"
                    value={formData.seatsAllocated}
                    onChange={handleInputChange}
                    placeholder="Enter number of seats"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    readOnly={!isEditModalOpen}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={toggleEditModal}
                className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Details
              </button>
            </div>

            {isEditModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Event Details</h2>
                    <button 
                      onClick={toggleEditModal}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Venue Location
                      </label>
                      <textarea
                        name="venue"
                        value={formData.venue}
                        onChange={handleInputChange}
                        placeholder="Enter detailed venue location"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[120px] text-gray-800"
                        rows="4"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seats Allocated
                      </label>
                      <input
                        type="number"
                        name="seatsAllocated"
                        value={formData.seatsAllocated}
                        onChange={handleInputChange}
                        placeholder="Enter number of seats"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-8 pt-4 border-t gap-4">
                    <button
                      onClick={toggleEditModal}
                      className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSave();
                        toggleEditModal();
                      }}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 1:
        return <AdminEmployeeAllocation />;
      case 2:
        return <AdminEventFood />;
      default:
        return null;
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!selectedEvent) return <div className="p-4">Event not found.</div>;

  return (
    <div className="flex min-h-screen ">
      <div className='w-full flex bg-white'>
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white z-10 transform border-r-2 border-grey-200 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex flex-col lg:w-64 p-4 pt-14`}
        >
          <button onClick={toggleSidebar} className="lg:hidden absolute top-4 right-4 text-gray-600">
            <FaTimes size={24} />
          </button>

          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center bg-purple-100">
              <span className="text-purple-600 font-semibold">Grip</span>
            </div>
            <h2 className="mt-4 text-lg font-semibold">Royal Events</h2>
            <p className="text-sm text-gray-500">{selectedEvent?.email || 'No email available'}</p>
          </div>

          <nav className="mt-6">
            <button
              onClick={() => {
                setActiveTab('eventDetails');
                toggleSidebar();
              }}
              className={`flex items-center p-2 rounded-md w-full text-left ${
                activeTab === 'eventDetails' ? 'bg-[#98ffe0] text-black border-b-2 border-black' : 'text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="ml-4">Event Details</span>
            </button>
            
            <button
              onClick={() => {
                setActiveTab('userRegistration');
                setCurrentStep(0);
                toggleSidebar();
              }}
              className={`flex items-center p-2 rounded-md w-full text-left mt-2 ${
                activeTab === 'userRegistration' ? 'bg-[#98ffe0] text-black border-b-2 border-black' : 'text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="ml-4">User Registration</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:py-8 overflow-x-hidden w-[900px] rounded-[1rem]">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-gray-600 focus:outline-none mb-4"
          >
            <FaBars size={24} />
          </button>

          {activeTab === 'eventDetails' ? (
            <>
              {renderEventDetailsContent()}
              {/* Navigation Buttons */}
              <div className="flex justify-end mt-4 space-x-4">
                {currentStep > 0 && (
                  <button 
                    onClick={handlePrevious}
                    className="px-5 py-2 text-black border-[1px] border-black rounded-full"
                  >
                    Previous
                  </button>
                )}
                {currentStep === 2 ? (
                  <button 
                    onClick={handleSave}
                    className="px-8 py-2 text-white bg-black rounded-full"
                  >
                    Save
                  </button>
                ) : currentStep < 2 && (
                  <button 
                    onClick={handleNext}
                    className="px-8 py-2 text-white bg-black rounded-full"
                  >
                    Next
                  </button>
                )}
              </div>
            </>
          ) : (
            <UserRegistration />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEventDetails;