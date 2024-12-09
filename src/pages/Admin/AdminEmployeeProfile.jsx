import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { RxPerson } from 'react-icons/rx';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import AdminEventsAssignedTable from '../../Components/Admin/AdminEventsAssignedTable';
import axiosInstance from '../../axiosConfig';
import idCardTemplate from '../../assets/id.png';

const AdminEmployeeProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('personal-info');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editSection, setEditSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for employee data
  const [employeeData, setEmployeeData] = useState(null);
  const [tempData, setTempData] = useState({});

  // Add new state for ID card data
  const [idCardData, setIdCardData] = useState(null);

  // Add this state for events data
  const [eventsData, setEventsData] = useState([]);

  // Add this state for check-in/out data
  const [checkInOutData, setCheckInOutData] = useState([]);

  // Get employee ID from URL params
  const { id } = useParams();

  // Fetch employee data
  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/employee-details/${id}/`);
      if (response.data?.status_code === 200) {
        setEmployeeData(response.data.data[0]);
      } else {
        setError('Failed to fetch employee data');
      }
    } catch (err) {
      setError('Error fetching employee data');
    } finally {
      setLoading(false);
    }
  };


  const fetchIdCardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/employees-id-card/${id}/`);
      if (response.data?.status_code === 200) {
        setIdCardData(response.data.data);
      } else {
        setError('Failed to fetch ID card data');
      }
    } catch (err) {
      setError('Error fetching ID card data');
    } finally {
      setLoading(false);
    }
  };

  // Add new function to fetch events data
  const fetchEventsData = async () => {
    try {
      const response = await axiosInstance.get(
        `/list-employees-assigned-events/${id}/`
      );
      if (response.data?.status_code === 200) {
        setEventsData(response.data.data || []);
      } else {
        setEventsData([]);
      }
    } catch (err) {
      setEventsData([]);
    }
  };

  // Add new function to fetch check-in/out data
  const fetchCheckInOutData = async () => {
    try {
      const response = await axiosInstance.get(`/employee-inout-details/${id}/`);
      if (response.data?.status_code === 200 && Array.isArray(response.data.data)) {
        setCheckInOutData(response.data.data);
      } else {
        setCheckInOutData([]);
      }
    } catch (err) {
      setCheckInOutData([]);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployeeData();
      fetchIdCardData();
      fetchEventsData();
      fetchCheckInOutData();
    }
  }, [id]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const openEditModal = (section) => {
    setEditSection(section);
    const editableFields = {
      id: employeeData.id,
      event_group: employeeData.event_group,
      name: employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone,
      position: employeeData.position,
      address: employeeData.address,
      is_available: employeeData.is_available,
      role: employeeData.role,
    };
    setTempData(editableFields);
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData((prevData) => ({ ...prevData, [name]: value }));
  };

  const saveChanges = async () => {
    try {
      // Create a payload with only the required fields
      const payload = {
        id: tempData.id,
        event_group: tempData.event_group,
        name: tempData.name,
        email: tempData.email,
        phone: tempData.phone,
        position: tempData.position,
        address: tempData.address,
        is_available: tempData.is_available,
        role: tempData.role,
      };

      const response = await axiosInstance.put(
        `/employee-details/${id}/`,
        payload
      );
      if (response.data?.status_code === 200) {
        setEmployeeData(tempData);
        setModalOpen(false);
      } else {
        setError('Failed to update employee data');
      }
    } catch (err) {
      setError('Error updating employee data');
    }
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white z-10 transform border-r-2 border-grey-200 ${
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
            className="w-20 h-20 rounded-full border-2 border-black"
            src="/profile_pic.svg"
            alt="Profile"
          />
          <h2 className="mt-4 text-lg font-semibold">{employeeData?.name}</h2>
          <p className="text-sm text-gray-500">{employeeData?.email}</p>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => handleNavigation('personal-info')}
            className={`flex items-center p-2 rounded-md w-full text-left ${
              activeSection === 'personal-info'
                ? 'bg-[#98FFE0] text-black border-b-2 border-black'
                : 'text-gray-600'
            }`}
          >
            <RxPerson />
            <span className="ml-4">Employee Info</span>
          </button>
          <button
            onClick={() => handleNavigation('events-assigned')}
            className={`flex items-center p-2 rounded-md w-full text-left ${
              activeSection === 'events-assigned'
                ? 'bg-[#98FFE0] text-black border-b-2 border-black'
                : 'text-gray-600'
            }`}
          >
            <RxPerson />
            <span className="ml-4">Events Assigned</span>
          </button>
          <button
            onClick={() => handleNavigation('id-card')}
            className={`flex items-center p-2 rounded-md w-full text-left ${
              activeSection === 'id-card'
                ? 'bg-[#98FFE0] text-black border-b-2 border-black'
                : 'text-gray-600'
            }`}
          >
            <RxPerson />
            <span className="ml-4">ID Card</span>
          </button>
          <button
            onClick={() => handleNavigation('check-in-out-log')}
            className={`flex items-center p-2 rounded-md w-full text-left ${
              activeSection === 'check-in-out-log'
                ? 'bg-[#98FFE0] text-black border-b-2 border-black'
                : 'text-gray-600'
            }`}
          >
            <RxPerson />
            <span className="ml-4">Check-In/Out Log</span>
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
            <span className="mr-2">←</span> Back to Employees
          </button>
        </div>

        {/* Content sections */}
        {activeSection === 'personal-info' && (
          <div className="bg-white p-6 rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">
              Employee Information
            </h1>
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
                <div className="flex flex-col xl:flex-row">
                  <p className="text-gray-500 w-52">Address</p>
                  <p>{employeeData?.address}</p>
                </div>
                <div className="flex flex-col xl:flex-row">
                  <p className="text-gray-500 w-52">Status</p>
                  <p>
                    {employeeData?.is_available ? 'Available' : 'Not Available'}
                  </p>
                </div>
                <div className="flex flex-col xl:flex-row">
                  <p className="text-gray-500 w-52">Role</p>
                  <p>{employeeData?.role}</p>
                </div>
              </div>
              <button
                className="mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
                onClick={() => openEditModal('employee-info')}
              >
                Edit
              </button>
            </div>
          </div>
        )}

        {activeSection === 'events-assigned' && (
          <div className="bg-white p-6 rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">Events Assigned</h1>
            <hr className="w-full border mb-5" />
            <AdminEventsAssignedTable
              data={eventsData}
              employeeId={employeeData?.id}
              employeeName={employeeData?.name}
            />
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
                    {/* Header Section - Reduced top margin */}
                    <div className="w-full text-white py-2 px-6 mt-4">
                      <h3 className="text-md font-semi-bold opacity-90 mb-0.5">
                        EVENT STAFF
                      </h3>
                      <h4 className="text-xs opacity-75">
                        {idCardData.event_group_name}
                      </h4>
                    </div>

                    {/* Profile Section - Reduced margin */}
                    <div className="mt-4 relative">
                      <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                        <img
                          src={`https://event.neurocode.in${idCardData.image}`}
                          alt="Employee"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Name and Position - Reduced margins */}
                    <div className="text-center mt-2 px-4">
                      <h2 className="text-xl font-bold text-[#1a237e] mb-1">
                        {idCardData.name}
                      </h2>
                      <span className="inline-block bg-[#e8eaf6] text-[#3949ab] px-3 py-0.5 rounded-full text-sm font-medium">
                        {idCardData.position}
                      </span>
                    </div>

                    {/* Contact Details - Reduced padding and spacing */}
                    <div className="w-[90%] px-6 mt-4 space-y-1.5">
                      <div className="flex items-center bg-white rounded-lg shadow-sm p-2 border-l-4 border-[#3949ab]">
                        <div className="w-6">
                          <svg
                            className="w-4 h-4 text-[#3949ab]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-500">Email</p>
                          <p className="text-xs font-medium text-gray-800 break-all">
                            {idCardData.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center bg-white rounded-lg shadow-sm p-2 border-l-4 border-[#3949ab]">
                        <div className="w-6">
                          <svg
                            className="w-4 h-4 text-[#3949ab]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-500">Phone</p>
                          <p className="text-xs font-medium text-gray-800">
                            {idCardData.phone}
                          </p>
                        </div>
                      </div>
                      {/* 
                      {idCardData.DOB && (
                        <div className="flex items-center bg-white rounded-lg shadow-sm p-2 border-l-4 border-[#3949ab]">
                          <div className="w-6">
                            <svg className="w-4 h-4 text-[#3949ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] text-gray-500">Date of Birth</p>
                            <p className="text-xs font-medium text-gray-800">{idCardData.DOB}</p>
                          </div>
                        </div>
                      )} */}
                    </div>

                    {/* QR Code - Adjusted margin */}
                    <div className="mt-4 mb-4">
                      <div className="bg-white p-1 rounded-lg shadow-md">
                        <img
                          src={`https://event.neurocode.in${idCardData.qr_code_image}`}
                          alt="QR Code"
                          className="w-16 h-16"
                          onError={(e) =>
                            console.log()
                          }
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

        {activeSection === 'check-in-out-log' && (
          <div className="bg-white p-6 rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">Daily Check-in Log</h1>
            <hr className="w-full border mb-5" />
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(checkInOutData) && checkInOutData.length > 0 ? (
                    checkInOutData.map((log, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.checkin_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.checkin_time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.checkout_time}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No check-in/out data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md h-[80vh] overflow-y-scroll">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Edit Employee Information
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={(e) => e.preventDefault()}>
                {Object.entries(tempData || {}).map(([key, value]) => {
                  if (key !== 'id' && key !== 'event_group') {
                    return (
                      <label key={key} className="block mb-4">
                        <span className="text-gray-700 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        {key === 'is_available' ? (
                          <select
                            name={key}
                            value={value}
                            onChange={handleInputChange}
                            className="w-full border p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value={true}>Available</option>
                            <option value={false}>Not Available</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            name={key}
                            value={value}
                            onChange={handleInputChange}
                            className="w-full border p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        )}
                      </label>
                    );
                  }
                  return null;
                })}
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
      </div>
    </div>
  );
};

export default AdminEmployeeProfile;
