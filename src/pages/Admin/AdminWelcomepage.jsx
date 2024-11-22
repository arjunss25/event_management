import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../axiosConfig';


const AdminWelcomePage = () => {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth); 
  const [eventGroupName, setEventGroupName] = useState('');
  const [eventName, setEventName] = useState('');

  // Fetch event group name on component mount
  useEffect(() => {
    const fetchEventGroupName = async () => {
      try {
        const response = await axiosInstance.get('/welcome-eventgroup-name/');
        setEventGroupName(response.data?.data?.event_group_name || 'Event Group');
      } catch (error) {
        console.error('Error fetching event group name:', error);
      }
    };
  
    fetchEventGroupName();
  }, []);
  useEffect(() => {
    const fetchEventName = async () => {
      try {
        const response = await axiosInstance.get('/welcome-eventgroup-name/');
        setEventName(response.data?.data?.event_name || 'Event');
      } catch (error) {
        console.error('Error fetching event group name:', error);
      }
    };
  
    fetchEventName();
  }, []);
  

  const handleNext = () => {
    navigate('/admin/profile-photo');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-50 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Welcome to Our Platform!</h1>
      <p className="text-xl mb-6">
        Hello, <span className="text-blue-600 font-semibold">{auth.user?.email || 'Admin'}</span>! 
        We're glad to have you here as part of 
        <span className="text-blue-600 font-semibold"> {eventGroupName}</span>,for
        <span className="text-blue-600 font-semibold"> {eventName}</span>
      </p>
      <button
        onClick={handleNext}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
      >
        Next
      </button>
    </div>
  );
};

export default AdminWelcomePage;
