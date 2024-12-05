import React, { useState, useEffect } from 'react';
import Dashboardcards from '../Components/Dashboardcards';
import {
  MdOutlineFoodBank,
  MdDinnerDining,
  MdFreeBreakfast,
  MdCoffee,
  MdRestaurant,
} from 'react-icons/md';
import { FaBowlRice } from 'react-icons/fa6';
import { GiMeal } from 'react-icons/gi';
import axiosInstance from '../axiosConfig';
import RegisteredUserTable from '../Components/Admin/RegisteredUserTable';
import { websocketService } from '../services/websocketService';

const AdminDashboard = () => {
  const [mealData, setMealData] = useState([]);

  // Helper function to get icon based on meal type
  const getMealIcon = (mealType) => {
    const type = mealType.toLowerCase();
    if (type.includes('breakfast')) {
      return <MdFreeBreakfast />;
    } else if (type.includes('lunch')) {
      return <FaBowlRice />;
    } else if (type.includes('dinner')) {
      return <MdDinnerDining />;
    } else if (type.includes('refreshment') || type.includes('snack')) {
      return <MdRestaurant />;
    } else if (type.includes('tea') || type.includes('coffee')) {
      return <MdCoffee />;
    } else if (type.includes('meal')) {
      return <GiMeal />;
    }
    // Default icon for unknown meal types
    return <MdOutlineFoodBank />;
  };

  useEffect(() => {
    // Fetch initial meal counts
    const fetchMealData = async () => {
      try {
        const response = await axiosInstance.get('/mealcount-currentdate/');
        if (response.data?.data) {
          const transformedData = response.data.data.map(meal => ({
            eventType: meal.meal_type_name,
            number: meal.count,
            icon: getMealIcon(meal.meal_type_name),
          }));
          setMealData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching meal counts:', error);
      }
    };

    fetchMealData();

    // Subscribe to WebSocket updates
    const unsubscribe = websocketService.subscribe((data) => {
      console.log('🔵 WebSocket message received:', data);
      
      // Match the backend consumer message format
      if (data.meal_type) {
        setMealData(prevData => {
          const updatedData = prevData.map(meal => {
            if (meal.eventType.toLowerCase() === data.meal_type.toLowerCase()) {
              console.log(`🎯 Updating count for ${meal.eventType} to ${data.count}`);
              return { ...meal, number: data.count };
            }
            return meal;
          });
          return updatedData;
        });
      }
    });

    websocketService.connect();

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      websocketService.disconnect();
    };
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-[#f7fafc] overflow-x-hidden">
      {/* main content */}
      <main className="w-full">
        {/* dashboard content */}
        <div className="w-full overflow-hidden">
          {/* dashboard-cards */}
          <div className="w-full flex gap-5 flex-wrap justify-center lg:justify-start">
            {mealData.map((item, i) => (
              <Dashboardcards key={i} eventData={item} />
            ))}
          </div>

          {/* table-component */}
          <div className="table-component mt-10">
            <h1 className="text-xl lg:text-2xl font-semibold mb-6">Events</h1>
            <RegisteredUserTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
