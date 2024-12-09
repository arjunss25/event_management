import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { RxPerson } from 'react-icons/rx';
import { useNavigate } from 'react-router-dom';
import idCardTemplate from '../../assets/id.png';
import axiosInstance from '../../axiosConfig';
import { useSelector } from 'react-redux';

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('personal-info');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for employee data
  const [employeeData, setEmployeeData] = useState(null);
  const [idCardData, setIdCardData] = useState(null);
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  // Fetch employee data from the API
  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/employees-id-card-login/');
      
      if (response.data?.status_code === 200) {
        const employeeDetails = response.data.data;
        setEmployeeData(employeeDetails);
        
        // Set ID card data using the response
        setIdCardData({
          name: employeeDetails.name,
          email: employeeDetails.email,
          phone: employeeDetails.phone,
          position: employeeDetails.position,
          event_group_name: employeeDetails.event_group_name,
          image: `https://event.neurocode.in${employeeDetails.image}`,
          qr_code_image: employeeDetails.qr_code_image 
            ? `https://event.neurocode.in${employeeDetails.qr_code_image}`
            : "/qr-code.png"
        });
      } else {
        setError('Failed to fetch employee data');
      }
    } catch (err) {
      setError('Error fetching employee data');
    } finally {
      setLoading(false);
    }
  };

  
  const fetchAssignedEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await axiosInstance.get('/employees-upcoming-event-details/');
      
      if (response.data?.status_code === 200) {
        const eventsData = response.data.data.events || [];
        setAssignedEvents(eventsData);
      } else {
        setEventsError('Failed to fetch assigned events');
      }
    } catch (err) {
      setEventsError('Error fetching assigned events');
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
    fetchAssignedEvents();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleNavigation = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-64 bg-white z-10 transform border-r-2 border-grey-200 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex flex-col lg:w-64 p-4`}>
        <button onClick={toggleSidebar} className="lg:hidden absolute top-4 right-4 text-gray-600">
          <FaTimes size={24} />
        </button>

        <div className="flex flex-col items-center">
          <img
            className="w-20 h-20 rounded-full border-2 border-black"
            src={`https://event.neurocode.in${employeeData?.image}`}
            alt="Profile"
          />
          <h2 className="mt-4 text-lg font-semibold">{employeeData?.name}</h2>
          <p className="text-sm text-gray-500">{employeeData?.email}</p>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => handleNavigation('personal-info')}
            className={`flex items-center p-2 rounded-md w-full text-left ${
              activeSection === 'personal-info' ? 'bg-[#98FFE0] text-black border-b-2 border-black' : 'text-gray-600'
            }`}
          >
            <RxPerson />
            <span className="ml-4">Employee Info</span>
          </button>
          <button
            onClick={() => handleNavigation('events-assigned')}
            className={`flex items-center p-2 rounded-md w-full text-left ${
              activeSection === 'events-assigned' ? 'bg-[#98FFE0] text-black border-b-2 border-black' : 'text-gray-600'
            }`}
          >
            <RxPerson />
            <span className="ml-4">Events Assigned</span>
          </button>
          <button
            onClick={() => handleNavigation('id-card')}
            className={`flex items-center p-2 rounded-md w-full text-left ${
              activeSection === 'id-card' ? 'bg-[#98FFE0] text-black border-b-2 border-black' : 'text-gray-600'
            }`}
          >
            <RxPerson />
            <span className="ml-4">ID Card</span>
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
            onClick={() => window.history.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
          >
            <span className="mr-2">←</span> Back
          </button>
        </div>

        {/* Content sections */}
        {activeSection === 'personal-info' && (
          <div className="bg-white p-6 rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">Employee Information</h1>
            <hr className="w-full border mb-5" />
            <div className="flex flex-col xl:flex-row items-start justify-between">
              <div className="grid grid-cols-1 gap-4 mt-2">
                <div className="flex flex-col xl:flex-row">
                  <p className="text-gray-500 w-52">Name</p>
                  <p>{employeeData?.name}</p>
                </div>
                <div className="flex flex-col xl:flex-row">
                  <p className="text-gray-500 w-52">Email</p>
                  <p>{employeeData?.email}</p>
                </div>
                <div className="flex flex-col xl:flex-row">
                  <p className="text-gray-500 w-52">Phone</p>
                  <p>{employeeData?.phone}</p>
                </div>
                <div className="flex flex-col xl:flex-row">
                  <p className="text-gray-500 w-52">Position</p>
                  <p>{employeeData?.position}</p>
                </div>
                {/* <div className="flex flex-col xl:flex-row">
                  <p className="text-gray-500 w-52">Address</p>
                  <p>{employeeData?.address}</p>
                </div> */}
                <div className="flex flex-col xl:flex-row">
                  <p className="text-gray-500 w-52">Event Group</p>
                  <p>{employeeData?.event_group_name}</p>
                </div>
                {employeeData?.DOB && (
                  <div className="flex flex-col xl:flex-row">
                    <p className="text-gray-500 w-52">Date of Birth</p>
                    <p>{employeeData.DOB}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'events-assigned' && (
          <div className="bg-white p-6 rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">Events Assigned</h1>
            <hr className="w-full border mb-5" />
            
            {eventsLoading ? (
              <div className="w-full h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : eventsError ? (
              <div className="p-4 text-red-500">{eventsError}</div>
            ) : assignedEvents.length === 0 ? (
              <div className="text-center text-gray-500">No events assigned</div>
            ) : (
              <div className="relative overflow-x-auto">
                <div className="min-w-[800px]">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-white uppercase bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 font-medium whitespace-nowrap">Event Name</th>
                        <th className="px-6 py-3 font-medium whitespace-nowrap">Start Date</th>
                        <th className="px-6 py-3 font-medium whitespace-nowrap">End Date</th>
                        <th className="px-6 py-3 font-medium whitespace-nowrap">Venue</th>
                        <th className="px-6 py-3 font-medium whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {assignedEvents.map((event, index) => (
                        <tr key={index} className="bg-white hover:bg-gray-50">
                          <td className="px-6 py-6 text-black whitespace-nowrap">{event.event_name}</td>
                          <td className="px-6 py-6 text-black whitespace-nowrap">{event.start_date}</td>
                          <td className="px-6 py-6 text-black whitespace-nowrap">{event.end_date}</td>
                          <td className="px-6 py-6 text-black whitespace-nowrap">{event.venue || 'Not specified'}</td>
                          <td className="px-6 py-6 whitespace-nowrap">
                            <div className="w-28">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                {event.event_status}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'id-card' && (
          <div className="bg-white p-6 rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">ID Card</h1>
            <hr className="w-full border mb-5" />
            
            {idCardData ? (
              <div className="max-w-md mx-auto relative">
                <div className="w-[350px] relative shadow-md rounded-2xl overflow-hidden">
                  {/* Background Template Image */}
                  <img 
                    src={idCardTemplate} 
                    alt="ID Card Template"
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Content overlaid on template */}
                  <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center">
                    {/* Header Section */}
                    <div className="w-full text-white py-2 px-6 mt-4">
                      <h3 className="text-md font-semi-bold opacity-90 mb-0.5">EVENT STAFF</h3>
                      <h4 className="text-xs opacity-75">{idCardData.event_group_name}</h4>
                    </div>

                    {/* Profile Section */}
                    <div className="mt-4 relative">
                      <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                        <img 
                          src={idCardData.image}
                          alt="Employee"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    {/* Name and Position */}
                    <div className="text-center mt-2 px-4">
                      <h2 className="text-xl font-bold text-[#1a237e] mb-1">{idCardData.name}</h2>
                      <span className="inline-block bg-[#e8eaf6] text-[#3949ab] px-3 py-0.5 rounded-full text-sm font-medium">
                        {idCardData.position}
                      </span>
                    </div>

                    {/* Contact Details */}
                    <div className="w-[90%] px-6 mt-4 space-y-1.5">
                      <div className="flex items-center bg-white rounded-lg shadow-sm p-2 border-l-4 border-[#3949ab]">
                        <div className="w-6">
                          <svg className="w-4 h-4 text-[#3949ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-500">Email</p>
                          <p className="text-xs font-medium text-gray-800 break-all">{idCardData.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center bg-white rounded-lg shadow-sm p-2 border-l-4 border-[#3949ab]">
                        <div className="w-6">
                          <svg className="w-4 h-4 text-[#3949ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-500">Phone</p>
                          <p className="text-xs font-medium text-gray-800">{idCardData.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="mt-4 mb-4">
                      <div className="bg-white p-1 rounded-lg shadow-md">
                        <img 
                          src={idCardData.qr_code_image}
                          alt="QR Code"
                          className="w-16 h-16"
                          onError={(e) => console.log()}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading ID card details...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
