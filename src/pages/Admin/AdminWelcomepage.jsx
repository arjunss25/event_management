import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import axiosInstance from '../../axiosConfig';

const AdminWelcomePage = () => {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axiosInstance.get('/welcome-eventgroup-name/');
        console.log('API Response:', response.data);
        setCompanyName(response.data?.data?.company_name || 'Company');
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchEventDetails();
  }, []);

  const handleNext = () => {
    navigate('/admin/events-list');
  };

  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-300 text-gray-800 w-full h-screen flex flex-col items-center justify-center">
      <div className="top-img-sec w-full h-[40vh] relative overflow-hidden">
        <img
          src="/eventimg.jpg"
          alt=""
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3">
          <motion.h1
            className="text-6xl font-extrabold text-white"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Welcome to Our Platform!
          </motion.h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-8 text-center space-y-8">
        <motion.p
          className="text-2xl mb-8 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          We're glad to have you here as part of
          <span className="text-blue-500 font-semibold"> {companyName}</span>
        </motion.p>
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <button
            onClick={handleNext}
            className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Next
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminWelcomePage;
