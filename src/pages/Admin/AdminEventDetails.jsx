import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSingleEvent } from '../../Redux/Slices/Admin/AdminEventSlice';
import { useParams } from 'react-router-dom';
import UserRegistration from './UserRegistration';
import AdminEmployeeAllocation from './AdminEmployeeAllocation';
import AdminEventFood from './AdminEventFood';
import { FaBars, FaTimes } from 'react-icons/fa';

const AdminEventDetails = () => {
  const { eventId } = useParams();
  const dispatch = useDispatch();
  const { selectedEvent, loading, error } = useSelector((state) => state.adminEvents);
  const [activeTab, setActiveTab] = useState('eventDetails');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // console.log('Fetching event with ID:', eventId);
    dispatch(fetchSingleEvent(eventId));
  }, [dispatch, eventId]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

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

  const handleSave = () => {
    // Add your save logic here
    console.log('Saving event food details...');
  };

  const renderEventDetailsContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">General Details</h2>
            <hr className="w-full border mb-5" />
            <div className="grid grid-cols-1 gap-4 mt-2">
              <div className="flex flex-col xl:flex-row">
                <p className="text-gray-500 w-52">Event:</p>
                <p>{selectedEvent?.eventName || 'N/A'}</p>
              </div>
              <div className="flex flex-col xl:flex-row">
                <p className="text-gray-500 w-52">Start Date:</p>
                <p>{selectedEvent?.startDate ? new Date(selectedEvent.startDate).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="flex flex-col xl:flex-row">
                <p className="text-gray-500 w-52">End Date:</p>
                <p>{selectedEvent?.endDate ? new Date(selectedEvent.endDate).toLocaleString() : 'N/A'}</p>
              </div>
              {/* <div className="flex flex-col xl:flex-row">
                <p className="text-gray-500 w-52">Venue:</p>
                <p>{selectedEvent?.venue || 'N/A'}</p>
              </div>
              <div className="flex flex-col xl:flex-row">
                <p className="text-gray-500 w-52">Seats Booked:</p>
                <p>{selectedEvent?.seatsBooked || '0'}</p>
              </div>
              <div className="flex flex-col xl:flex-row">
                <p className="text-gray-500 w-52">Total Seats:</p>
                <p>{selectedEvent?.totalSeats || '0'}</p>
              </div> */}
              <div className="flex flex-col xl:flex-row">
                <p className="text-gray-500 w-52">Payment Status:</p>
                <p className={`${
                  selectedEvent?.paymentStatus === 'Completed' ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {selectedEvent?.paymentStatus || 'N/A'}
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-20 mb-4">Additional Info</h2>
            <hr className="w-full border mb-5" />
            <div className="grid grid-cols-1 gap-4 mt-2">
                  <div>
                    <div>
                      <label className="block text-black mb-2">Venue</label>
                      <textarea
                        placeholder="Venue"
                        className="w-[50%] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        rows="4" // Adjust the number of rows as needed
                      ></textarea>
                    </div>
                  </div>
                  <div>
                    <label className="block text-black mb-2">Seats Allocated</label>
                    <input 
                      type="text" 
                      placeholder="Number of Seats Allocated" 
                      className="w-[50%] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
              
              </div>



          </div>

          
        );
      case 1:
        return <AdminEmployeeAllocation eventId={eventId} />;
      case 2:
        return <AdminEventFood eventId={eventId} />;
      default:
        return null;
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!selectedEvent) {
    // console.log('No selected event found.');
    return <div className="p-4">Event not found.</div>;
  }

  return (
    <div className="flex min-h-screen p-5  lg:p-10">
      
     <div className='w-full flex bg-white'>
      {/* Sidebar */}
     <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-10 transform border-r-2 border-grey-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex flex-col lg:w-64 p-4  pt-14`}
      >
        <button onClick={toggleSidebar} className="lg:hidden absolute top-4 right-4 text-gray-600">
          <FaTimes size={24} />
        </button>

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center bg-purple-100">
            <span className="text-purple-600 font-semibold">Grip</span>
          </div>
          <h2 className="mt-4 text-lg font-semibold">Royal Events</h2>
          <p className="text-sm text-gray-500">royalevents@gmail.com</p>
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
      <div className="flex-1 p-4 lg:p-8 overflow-x-hidden w-[900px]">
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
                  className="px-4 py-2 text-white bg-gray-500 rounded-lg"
                >
                  Previous
                </button>
              )}
              {currentStep === 2 ? (
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 text-white bg-green-600 rounded-lg"
                >
                  Save
                </button>
              ) : currentStep < 2 && (
                <button 
                  onClick={handleNext}
                  className="px-4 py-2 text-white bg-black rounded-lg"
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