import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoMdClose } from 'react-icons/io';

// Assuming these will be provided in your slice
/*
import {
  selectDays,
  selectMealCategories,
  selectSelectedMeal,
  addMealCategory,
  addMealItem,
  removeMealItem,
  setSelectedMeal,
  setApplyToAllDays,
  addNewDay
} from '../../Redux/Slices/Admin/eventFoodSlice';
*/

const AdminEventFood = () => {
  const dispatch = useDispatch();

  // These will come from your Redux store
  /*
  const days = useSelector(selectDays);
  const mealCategories = useSelector(selectMealCategories);
  const selectedMeal = useSelector(selectSelectedMeal);
  const applyToAllDays = useSelector(selectApplyToAllDays);
  */

  // Temporary data for UI structure
  const days = [
    {
      id: 1,
      meals: [
        { id: 'breakfast', name: 'Breakfast', items: [] },
        { id: 'lunch', name: 'Lunch', items: [] },
        { id: 'dinner', name: 'Dinner', items: [] }
      ]
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen gap-4 p-4">
      {/* Left Section - Daily Meal Overview */}
      <div className="w-full lg:w-1/2 bg-white rounded-lg p-4 shadow-md">
        <h2 className="text-xl font-semibold mb-4 lg:mb-6 text-gray-800">Daily Meal Overview</h2>
        
        <div className="mb-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              onChange={(e) => dispatch(setApplyToAllDays(e.target.checked))}
            />
            <span>Apply for All Days</span>
          </label>
        </div>

        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {days.map((day) => (
            <div key={day.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Day {day.id}</h3>
              
              <div className="space-y-4">
                {day.meals.map((meal) => (
                  <div key={meal.id} className="relative">
                    <button
                      onClick={() => dispatch(setSelectedMeal({ dayId: day.id, ...meal }))}
                      className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors flex justify-between items-center"
                    >
                      <span className="font-medium">{meal.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {meal.items?.length || 0} items
                        </span>
                        <IoMdClose 
                          className="text-gray-400 hover:text-gray-600" 
                          size={20}
                        />
                      </div>
                    </button>
                    
                    {meal.items && meal.items.length > 0 && (
                      <div className="mt-2 pl-4 space-y-2">
                        {meal.items.map((item) => (
                          <div 
                            key={item.id}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                          >
                            <span>{item.name}</span>
                            <button
                              onClick={() => dispatch(removeMealItem({ 
                                dayId: day.id, 
                                mealId: meal.id, 
                                itemId: item.id 
                              }))}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <IoMdClose size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {day.id === days.length && (
                <button
                  onClick={() => dispatch(addNewDay())}
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors w-full sm:w-auto"
                >
                  Next Day
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Section - Add Meal Category */}
      <div className="w-full lg:w-1/2 bg-black rounded-lg p-4 lg:p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4 lg:mb-6 text-white">Add Meal Category</h2>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Meal Category"
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                dispatch(addMealCategory(e.target.value));
                e.target.value = '';
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Meal Category"]');
              if (input.value.trim()) {
                dispatch(addMealCategory(input.value));
                input.value = '';
              }
            }}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEventFood;