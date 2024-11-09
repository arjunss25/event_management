import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaBars, FaTimes } from 'react-icons/fa';
import { ArrowLeft, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { GiHotMeal } from "react-icons/gi";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { users } = useSelector((state) => state.adminUserRegistration);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [expandedDay, setExpandedDay] = useState('day5');
  
  const user = users.find((user) => user.id.toString() === userId);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const meals = {
    breakfast: true,
    lunch: true,
    dinner: true
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">User not found</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'basicInfo':
        return (
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center mb-6">
              <ArrowLeft 
                className="w-5 h-5 mr-2 cursor-pointer" 
                onClick={() => navigate('/admin/users')}
              />
              <h2 className="text-2xl font-semibold">Basic Information</h2>
            </div>
            <hr className="w-full border mb-5" />
            
            <div className="grid grid-cols-1 gap-4 mt-2">
              <div className="flex flex-col xl:flex-row">
                <p className="text-gray-500 w-52">User ID:</p>
                <p>{user.id}</p>
              </div>
              <div className="flex flex-col xl:flex-row">
                <p className="text-gray-500 w-52">Username:</p>
                <p>{user.username}</p>
              </div>
              <div className="flex flex-col xl:flex-row">
                <p className="text-gray-500 w-52">Email:</p>
                <p>{user.email}</p>
              </div>
              <div className="flex flex-col xl:flex-row">
                <p className="text-gray-500 w-52">Phone:</p>
                <p>{user.phone}</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-20 mb-4">Additional Info</h2>
            <hr className="w-full border mb-5" />
            <div className="grid grid-cols-1 gap-4 mt-2">
              <div className="flex flex-col xl:flex-row">
                <p className="text-gray-500 w-52">Registration Date:</p>
                <p>{user.registrationDate}</p>
              </div>
              {user.address && (
                <div className="flex flex-col xl:flex-row">
                  <p className="text-gray-500 w-52">Address:</p>
                  <p>{user.address}</p>
                </div>
              )}
              <div className="flex flex-col xl:flex-row">
                <p className="text-gray-500 w-52">Status:</p>
                <span className="inline-block px-2 py-1 text-sm font-medium bg-emerald-100 text-emerald-800 rounded">
                  Active
                </span>
              </div>
            </div>
          </div>
        );
      case 'mealInfo':
        return (
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Meal Info</h2>
            <div className="space-y-3">
              {['day1', 'day2', 'day3', 'day4', 'day5'].map((day, index) => (
                <div key={day} className="border rounded-lg">
                  <button
                    onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                    className="w-full px-4 py-3 flex justify-between items-center text-left hover:bg-gray-50 rounded-lg"
                  >
                    <span>Day {index + 1}</span>
                    {expandedDay === day ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedDay === day && (
                    <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
                      <div className="space-y-2">
                        {Object.entries(meals).map(([meal, isCompleted]) => (
                          <div key={meal} className="flex items-center space-x-2">
                            {isCompleted && (
                              <Check className="w-4 h-4 text-green-500" />
                            )}
                            <span className={isCompleted ? 'text-black' : 'text-gray-500'}>
                              {meal.charAt(0).toUpperCase() + meal.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-full flex bg-white">
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
              <span className="text-purple-600 font-semibold">
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <h2 className="mt-4 text-lg font-semibold">{user.username}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <nav className="mt-6">
            <button
              onClick={() => {
                setActiveTab('basicInfo');
                toggleSidebar();
              }}
              className={`flex items-center p-2 rounded-md w-full text-left ${
                activeTab === 'basicInfo' ? 'bg-[#98ffe0] text-black border-b-2 border-black' : 'text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="ml-4">Basic Information</span>
            </button>
            
            <button
              onClick={() => {
                setActiveTab('mealInfo');
                toggleSidebar();
              }}
              className={`flex items-center p-2 rounded-md w-full text-left mt-2 ${
                activeTab === 'mealInfo' ? 'bg-[#98ffe0] text-black border-b-2 border-black' : 'text-gray-600'
              }`}
            >
              <GiHotMeal />
              <span className="ml-4">Meal Info</span>
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

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;