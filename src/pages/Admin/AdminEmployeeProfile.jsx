import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { RxPerson } from 'react-icons/rx';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminEventsAssignedTable from '../../Components/Admin/AdminEventsAssignedTable';

const AdminEmployeeProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('personal-info');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editSection, setEditSection] = useState('');

  const [basicInfo, setBasicInfo] = useState({
    Name: 'Royal Events',
    EmployeeId: '1123',
    email: 'royalevents@gmail.com',
    phone: '7456322265',
  });
  
  const [jobInfo, setJobInfo] = useState({
    Position: 'Event Manager',
    Department: 'Event Manager',
    EmploymentType: 'Full Time',
    DOB: '2024-11-24',
    address: 'xyz, Tvm, Kerala',
  });

  const [tempData, setTempData] = useState({});

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const openEditModal = (section) => {
    setEditSection(section);
    setTempData(section === 'basic-info' ? { ...basicInfo } : { ...jobInfo });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData(prevData => ({ ...prevData, [name]: value }));
  };

  const saveChanges = () => {
    if (editSection === 'basic-info') {
      setBasicInfo(tempData);
    } else {
      setJobInfo(tempData);
    }
    setModalOpen(false);
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

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
          <h2 className="mt-4 text-lg font-semibold">{basicInfo.Name}</h2>
          <p className="text-sm text-gray-500">{basicInfo.email}</p>
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
            <h1 className="text-2xl font-semibold mb-4">Basic Info</h1>
            <hr className="w-full border mb-5" />
            <div className="flex flex-col xl:flex-row items-start justify-between">
              <div className="grid grid-cols-1 gap-4 mt-2">
                {Object.entries(basicInfo).map(([key, value]) => (
                  <div key={key} className="flex flex-col xl:flex-row">
                    <p className="text-gray-500 w-52 capitalize">{key}</p>
                    <p>{value}</p>
                  </div>
                ))}
              </div>
              <button
                className="mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
                onClick={() => openEditModal('basic-info')}
              >
                Edit
              </button>
            </div>

            <section className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Job Details</h2>
              <hr className="w-full border mb-5" />
              <div className="edit-fields flex flex-col xl:flex-row items-start justify-between">
                <div className="grid grid-cols-1 gap-4 mt-2">
                  {Object.entries(jobInfo).map(([key, value]) => (
                    <div key={key} className="flex flex-col xl:flex-row">
                      <p className="text-gray-500 w-52 capitalize">{key}</p>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>
                <button
                  className="mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
                  onClick={() => openEditModal('job-info')}
                >
                  Edit
                </button>
              </div>
            </section>
          </div>
        )}

        {activeSection === 'events-assigned' && (
          <div className="bg-white p-6 rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">Events Assigned</h1>
            <hr className="w-full border mb-5" />
            <AdminEventsAssignedTable />
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
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Edit {editSection === 'basic-info' ? 'Basic Info' : 'Job Details'}
                </h2>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={(e) => e.preventDefault()}>
                {Object.entries(tempData).map(([key, value]) => (
                  <label key={key} className="block mb-4">
                    <span className="text-gray-700 capitalize">{key}</span>
                    <input
                      type="text"
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className="w-full border p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </label>
                ))}
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