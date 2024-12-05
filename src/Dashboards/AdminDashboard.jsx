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
  // Move getMealIcon function before the state initialization
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

  // Remove defaultMealTypes and initialize mealData as empty array
  const [mealData, setMealData] = useState([]);

  useEffect(() => {
    // Fetch unique meal types and current counts
    const initializeDashboard = async () => {
      try {
        // Fetch unique meal types
        const uniqueMealsResponse = await axiosInstance.get('/unique-meals-list/');
        const mealTypes = uniqueMealsResponse.data?.data || [];

        // Fetch current counts
        const countsResponse = await axiosInstance.get('/mealcount-currentdate/');
        const currentCounts = countsResponse.data?.data?.reduce((acc, meal) => {
          acc[meal.meal_type_name.toLowerCase()] = meal.count;
          return acc;
        }, {}) || {};

        // Create meal data array with counts
        const initialMealData = mealTypes.map(mealType => ({
          eventType: mealType,
          number: currentCounts[mealType.toLowerCase()] || 0,
          icon: getMealIcon(mealType)
        }));

        setMealData(initialMealData);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      }
    };

    initializeDashboard();

    // WebSocket subscription
    const unsubscribe = websocketService.subscribe((data) => {
      console.log('🔵 WebSocket message received:', data);
      
      if (data.meal_type) {
        setMealData(prevData => prevData.map(meal => 
          meal.eventType.toLowerCase() === data.meal_type.toLowerCase()
            ? { ...meal, number: data.new_count }
            : meal
        ));
      }
    });

    websocketService.connect();

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
