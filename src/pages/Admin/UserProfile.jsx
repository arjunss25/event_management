import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaCheck } from 'react-icons/fa';
import { RxPerson } from 'react-icons/rx';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('user-info');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for user data
  const [userData, setUserData] = useState(null);
  const [mealData, setMealData] = useState([]);
  const [allocatedMeals, setAllocatedMeals] = useState([]);
  const [expandedDays, setExpandedDays] = useState({});
  const [mealConsumption, setMealConsumption] = useState({});

  // Get user ID from URL params
  const { id } = useParams();

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.get(`/user-details/${id}/`);
      
      if (response.data?.status_code === 200) {
        setUserData(response.data.data);
      } else {
        setError('Failed to fetch user data');
      }
    } catch (err) {
      setError(`Error fetching user data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch meal data

  
  // const fetchMealData = async () => {
  //   try {
  //     const response = await axiosInstance.get(`/user-meals/${id}/`);
  //     if (response.data?.status_code === 200) {
  //       setMealData(response.data.data || []);
  //     } else {
  //       setMealData([]);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching meal data:', err);
  //     setMealData([]);
  //   }
  // };

  // Add this new fetch function
  const fetchAllocatedMeals = async () => {
    try {
      const response = await axiosInstance.get('/allocated-meals-list/');
      if (response.data?.status_code === 200) {
        setAllocatedMeals(response.data.data || []);
      }
    } catch (err) {
    }
  };

  // Add this new fetch function
  const fetchMealConsumption = async (date) => {
    try {
      const response = await axiosInstance.get(`/user-meal-info/${id}/${date}/`);
      if (response.data?.status_code === 200) {
        setMealConsumption(prev => ({
          ...prev,
          [date]: response.data.data
        }));
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserData();
      // fetchMealData();
      fetchAllocatedMeals();
    }
  }, [id]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleNavigation = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const toggleDay = (dayId, date) => {
    setExpandedDays(prev => {
      const newState = {
        ...prev,
        [dayId]: !prev[dayId]
      };
      
      // Fetch meal consumption when expanding
      if (newState[dayId]) {
        fetchMealConsumption(date);
      }
      return newState;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-center mb-4">{error}</div>
        <button 
          onClick={() => navigate('/admin/registered-users')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Users List
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-600 text-center mb-4">User not found</div>
        <button 
          onClick={() => navigate('/admin/registered-users')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Users List
        </button>
      </div>
    );
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

        <div className="flex flex-col items-center mt-16">
          <img
            className="w-20 h-20 rounded-full"
            src="/profile-avatar.png"
            alt="Profile"
          />
          <h2 className="mt-4 text-lg font-semibold">{userData?.full_name}</h2>
          <p className="text-sm text-gray-500 w-[80%] truncate">{userData?.email}</p>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => handleNavigation('user-info')}
            className={`flex items-center p-2 rounded-md w-full text-left ${
              activeSection === 'user-info' ? 'bg-[#98FFE0] text-black border-b-2 border-black' : 'text-gray-600'
            }`}
          >
            <RxPerson />
            <span className="ml-4">User Info</span>
          </button>
          <button
            onClick={() => handleNavigation('meals')}
            className={`flex items-center p-2 rounded-md w-full text-left ${
              activeSection === 'meals' ? 'bg-[#98FFE0] text-black border-b-2 border-black' : 'text-gray-600'
            }`}
          >
            <RxPerson />
            <span className="ml-4">Meals</span>
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
            <span className="mr-2">←</span> Back to Users
          </button>
        </div>
        {/* Content Sections */}
        <div className="max-w-4xl mx-auto mt-12 md:mt-0 relative">
          {activeSection === 'user-info' && (
            <div className="bg-white p-6 rounded-lg">
              <h1 className="text-2xl font-semibold mb-4">User Information</h1>
              <hr className="w-full border mb-5" />
              <div className="flex flex-col xl:flex-row items-start justify-between">
                <div className="grid grid-cols-1 gap-4 mt-2">
                  <div className="flex flex-col xl:flex-row">
                    <p className="text-gray-500 w-52">Full Name</p>
                    <p>{userData?.full_name}</p>
                  </div>
                  <div className="flex flex-col xl:flex-row">
                    <p className="text-gray-500 w-52">Email</p>
                    <p>{userData?.email}</p>
                  </div>
                  {/* <div className="flex flex-col xl:flex-row">
                    <p className="text-gray-500 w-52">Phone</p>
                    <p>{userData?.phone}</p>
                  </div> */}
                  <div className="flex flex-col xl:flex-row">
                    <p className="text-gray-500 w-52">Created Date</p>
                    <p>{formatDate(userData?.created_date)}</p>
                  </div>
                  {/* <div className="flex flex-col xl:flex-row">
                    <p className="text-gray-500 w-52">Event ID</p>
                    <p>{userData?.event}</p>
                  </div> */}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'meals' && (
            <div className="bg-white rounded-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-6">Allocated Meals</h2>
              
              <div className="meal-details-section w-full flex flex-col items-center gap-3">
                {allocatedMeals.map((day, index) => (
                  <div key={day.id} className="w-full">
                    <button
                      onClick={() => toggleDay(day.id, day.date)}
                      className="w-full bg-white border border-gray-500 rounded-md px-4 py-2 flex justify-between items-center hover:bg-gray-50"
                    >
                      <span className="text-gray-700">Day {index + 1} - {formatDate(day.date)}</span>
                      {expandedDays[day.id] ? (
                        <FiChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <FiChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedDays[day.id] && (
                      <div className="mt-1 border border-gray-200 rounded-md overflow-hidden">
                        {day.meal_types.map((meal) => (
                          <div 
                            key={`${day.id}-${meal.id}`}
                            className="p-3 bg-gray-50 border-t border-gray-200 first:border-t-0"
                          >
                            <div className="flex items-center justify-between">
                              <span>{meal.name}</span>
                              {mealConsumption[day.date]?.[meal.name] && (
                                <FaCheck className="text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
