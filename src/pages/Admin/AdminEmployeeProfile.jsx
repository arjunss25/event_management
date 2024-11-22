import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { RxPerson } from 'react-icons/rx';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import AdminEventsAssignedTable from '../../Components/Admin/AdminEventsAssignedTable';
import axiosInstance from '../../axiosConfig';

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
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployeeData();
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
      role: employeeData.role
    };
    setTempData(editableFields);
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData(prevData => ({ ...prevData, [name]: value }));
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
        role: tempData.role
      };
  
      const response = await axiosInstance.put(`/employee-details/${id}/`, payload);
      if (response.data?.status_code === 200) {
        setEmployeeData(tempData);
        setModalOpen(false);
      } else {
        setError('Failed to update employee data');
      }
    } catch (err) {
      setError('Error updating employee data');
      console.error('Error:', err);
    }
  };
  

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
            <span className="mr-2">←</span> Back to Employees
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
                <div className="flex flex-col xl:flex-row">
                  <p className="text-gray-500 w-52">Address</p>
                  <p>{employeeData?.address}</p>
                </div>
                <div className="flex flex-col xl:flex-row">
                  <p className="text-gray-500 w-52">Status</p>
                  <p>{employeeData?.is_available ? 'Available' : 'Not Available'}</p>
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
            <AdminEventsAssignedTable employeeId={id} />
          </div>
        )}

        {activeSection === 'id-card' && (
          <div className="bg-white p-6 rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">ID Card</h1>
            <hr className="w-full border mb-5" />
            <p>ID card details will be displayed here.</p>
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md h-[80vh] overflow-y-scroll">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Employee Information</h2>
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
                        <span className="text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
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