import React, { useEffect } from 'react';
import './AdminEventFood.css'
import { useDispatch, useSelector } from 'react-redux';
import { IoMdClose } from 'react-icons/io';
import {
  addDay,
  removeDay,
  setSelectedDay,
  setTotalDays,
  addMealCategory,
  removeMealCategory,
  setApplyToAllDays,
  selectDays,
  selectApplyToAllDays,
  selectSelectedDayId,
} from '../../Redux/Slices/Admin/eventFoodSlice';

const AdminEventFood = () => {
  const dispatch = useDispatch();
  const days = useSelector(selectDays);
  const applyToAllDays = useSelector(selectApplyToAllDays);
  const selectedDayId = useSelector(selectSelectedDayId);
  const selectedEvent = useSelector((state) => state.adminEvents.selectedEvent);
  
  useEffect(() => {
    if (selectedEvent?.startDate && selectedEvent?.endDate) {
      const start = new Date(selectedEvent.startDate);
      const end = new Date(selectedEvent.endDate);
      const diffTime = Math.abs(end - start);
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      dispatch(setTotalDays(totalDays));
    }
  }, [selectedEvent, dispatch]);

  const handleAddMealCategory = (categoryName) => {
    if (categoryName.trim()) {
      dispatch(addMealCategory({
        dayId: selectedDayId,
        categoryName: categoryName.trim()
      }));
    }
  };

  const handleRemoveMealCategory = (dayId, mealId) => {
    dispatch(removeMealCategory({ dayId, mealId }));
  };

  const handleRemoveDay = (dayId) => {
    dispatch(removeDay(dayId));
  };

  const handleDaySelection = (dayId) => {
    dispatch(setSelectedDay(dayId));
  };

  const handleAddNextDay = () => {
    dispatch(addDay());
  };

  return (
    <div className="flex flex-col lg:flex-row w-full gap-4 p-4">
      {/* Left Section - Daily Meal Overview */}
      <div className="w-full lg:w-1/2 bg-white rounded-lg meal-sec ">
        <h2 className="text-xl font-semibold mb-4 lg:mb-6 text-gray-800">Daily Meal Overview</h2>
        
        <div className="mb-4 px-5 py-3 bg-black text-white w-fit rounded-full">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={applyToAllDays}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              onChange={(e) => dispatch(setApplyToAllDays(e.target.checked))}
            />
            <span>Apply for All Days</span>
          </label>
        </div>

        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {days.map((day) => (
            <div 
              key={day.id} 
              className={`border rounded-lg p-4 relative ${selectedDayId === day.id ? 'border-blue-500 ring-2 ring-blue-200' : ''}`}
              onClick={() => handleDaySelection(day.id)}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Day {day.id}</h3>
                {days.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDay(day.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <IoMdClose size={20} />
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {day.meals.map((meal) => (
                  <div key={meal.id} className="relative">
                    <div className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors flex justify-between items-center">
                      <span className="font-medium">{meal.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {meal.items?.length || 0} items
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMealCategory(day.id, meal.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <IoMdClose size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!applyToAllDays && days.length < (selectedEvent?.totalDays || 1) && (
          <button
            onClick={handleAddNextDay}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add Next Day
          </button>
        )}
      </div>

      {/* Right Section - Add Meal Category */}
      <div className="w-full lg:w-1/2 bg-black rounded-lg p-4 lg:p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4 lg:mb-6 text-white">
          Add Meal Category {selectedDayId ? `for Day ${selectedDayId}` : ''}
        </h2>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Meal Category"
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddMealCategory(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Meal Category"]');
              handleAddMealCategory(input.value);
              input.value = '';
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