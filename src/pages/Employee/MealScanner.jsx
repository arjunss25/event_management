// src/components/Employee/MealScanner.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import {
  getDays,
  toggleDay,
  selectMeal,
  toggleScanner,
} from '../../Redux/Slices/Employee/mealScannerSlice';
import EmployeeScanner from '../../Components/Employee/EmployeeScanner';


const MealScanner = () => {
  const dispatch = useDispatch();
  const {
    days,
    selectedMeals,
    status,
    error,
    scannerOpen,
    currentScanningMeal,
  } = useSelector((state) => state.mealScanner);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getDays());
    }
  }, [status, dispatch]);

  const handleDayClick = (dayId) => {
    dispatch(toggleDay(dayId));
  };

  const handleMealSelect = (dayId, mealCategory, date) => {
    dispatch(
      toggleScanner({
        isOpen: true,
        mealInfo: {
          dayId,
          mealCategory,
          date,
        },
      })
    );
  };

  const handleScannerClose = () => {
    dispatch(toggleScanner({ isOpen: false, mealInfo: null }));
  };

  if (status === 'loading') {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md w-full">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error.message}
              </h3>
            </div>
          </div>
          <button
            onClick={() => dispatch(getDays())}
            className="mt-4 w-full bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(days) || days.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="text-center py-4">
          No meal schedules are currently available. Please check back later.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-2 sm:p-4 space-y-2">
      <h2 className="text-xl font-semibold mb-4 px-2 sm:px-0">Event Day Meal Scanner</h2>

      <div className="meal-details-section w-full flex flex-col items-center gap-3 bg-white p-4 sm:p-20">
        {Array.isArray(days) &&
          days.map((day) => (
            <div key={day.id} className="w-full sm:w-[80%]">
              <button
                onClick={() => handleDayClick(day.id)}
                className="w-full bg-white border border-gray-500 rounded-md px-3 sm:px-4 py-2 flex justify-between items-center hover:bg-gray-50"
              >
                <span className="text-gray-700 text-sm sm:text-base">{day.name}</span>
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
                      onClick={() =>
                        handleMealSelect(day.id, meal.name, day.date)
                      }
                      className={`p-2 sm:p-3 cursor-pointer text-sm sm:text-base ${
                        selectedMeals[day.id]?.includes(meal.name)
                          ? 'bg-[#98f5e1]'
                          : 'bg-gray-50'
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
