// src/components/Employee/MealScanner.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { getDays, toggleDay, selectMeal } from '../../Redux/Slices/Employee/mealScannerSlice';

const MealScanner = () => {
  const dispatch = useDispatch();
  const { days, selectedMeals, status, error } = useSelector(state => state.mealScanner);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getDays());
    }
  }, [status, dispatch]);

  const handleDayClick = (dayId) => {
    dispatch(toggleDay(dayId));
  };

  const handleMealSelect = (dayId, mealCategory) => {
    const currentSelected = selectedMeals[dayId] || [];
    const updatedSelection = currentSelected.includes(mealCategory)
      ? currentSelected.filter(cat => cat !== mealCategory)
      : [...currentSelected, mealCategory];
    
    dispatch(selectMeal({ dayId, selectedCategories: updatedSelection }));
  };

  if (status === 'loading') {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="text-center py-4">Loading meal data...</div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="text-center py-4 text-red-500">
          Error: {error || 'Failed to load meal data'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 space-y-2">
      <h2 className="text-xl font-semibold mb-4">Event Day Meal Scanner</h2>
      
      <div className="meal-details-section w-full flex flex-col items-center gap-3 bg-white p-20">
      {Array.isArray(days) && days.map((day) => (
        <div key={day.id} className="w-[80%] ">
          <button
            onClick={() => handleDayClick(day.id)}
            className="w-full bg-white border border-gray-500 rounded-md px-4 py-2 flex justify-between items-center hover:bg-gray-50"
          >
            <span className="text-gray-700">{day.name}</span>
            {day.isOpen ? (
              <FiChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <FiChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {day.isOpen && Array.isArray(day.mealCategories) && (
            <div className="mt-1 border border-gray-200 rounded-md overflow-hidden">
              {day.mealCategories.map((category, index) => (
                <div 
                  key={index}
                  onClick={() => handleMealSelect(day.id, category)}
                  className={`p-3 cursor-pointer ${
                    selectedMeals[day.id]?.includes(category) ? 'bg-[#98f5e1]' : 'bg-gray-50'
                  } border-t border-gray-200 first:border-t-0 hover:bg-[#98f5e1] transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category}</span>
                    {selectedMeals[day.id]?.includes(category) && (
                      <span className="text-green-600">✓</span>
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
  );
};

export default MealScanner;