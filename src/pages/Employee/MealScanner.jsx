// src/components/Employee/MealScanner.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { getDays, toggleDay, selectMeal, toggleScanner } from '../../Redux/Slices/Employee/mealScannerSlice';
import EmployeeScanner from '../../Components/Employee/EmployeeScanner';

const MealScanner = () => {
  const dispatch = useDispatch();
  const { 
    days, 
    selectedMeals, 
    status, 
    error, 
    scannerOpen, 
    currentScanningMeal 
  } = useSelector(state => state.mealScanner);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getDays());
    }
  }, [status, dispatch]);

  const handleDayClick = (dayId) => {
    dispatch(toggleDay(dayId));
  };

  const handleMealSelect = (dayId, mealCategory) => {
    dispatch(toggleScanner({ 
      isOpen: true, 
      mealInfo: {
        dayId,
        mealCategory
      }
    }));
  };

  const handleScannerClose = () => {
    dispatch(toggleScanner({ isOpen: false, mealInfo: null }));
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
          <div key={day.id} className="w-[80%]">
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
                {day.mealCategories.map((meal, index) => (
                  <div 
                    key={`${day.id}-${meal.name}-${index}`}
                    onClick={() => handleMealSelect(day.id, meal.name)}
                    className={`p-3 cursor-pointer ${
                      selectedMeals[day.id]?.includes(meal.name) ? 'bg-[#98f5e1]' : 'bg-gray-50'
                    } border-t border-gray-200 first:border-t-0 hover:bg-[#98f5e1] transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{meal.name}</span>
                      {selectedMeals[day.id]?.includes(meal.name) && (
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
      
      {scannerOpen && (
        <EmployeeScanner 
          onClose={handleScannerClose}
          mealInfo={currentScanningMeal}
        />
      )}
    </div>
  );
};

export default MealScanner;