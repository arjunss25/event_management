import React, { useEffect, useState } from 'react';
import './AdminEventFood.css';
import { useDispatch, useSelector } from 'react-redux';
import { IoMdClose } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
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
  fetchMeals,
  selectMealsLoading,
  selectMealsError,
  postMealCategory,
  postMealCategoryForDate,
  postRemoveMealCategory,
} from '../../Redux/Slices/Admin/eventFoodSlice';
import { motion, AnimatePresence } from 'framer-motion';

const AdminEventFood = () => {
  const dispatch = useDispatch();
  const days = useSelector(selectDays);
  const applyToAllDays = useSelector(selectApplyToAllDays);
  const selectedDayId = useSelector(selectSelectedDayId);
  const selectedEvent = useSelector((state) => state.adminEvents.selectedEvent);
  const loading = useSelector(selectMealsLoading);
  const error = useSelector(selectMealsError);

  useEffect(() => {
    if (selectedEvent?.startDate && selectedEvent?.endDate) {
      const start = new Date(selectedEvent.startDate);
      const end = new Date(selectedEvent.endDate);
      const diffTime = Math.abs(end - start);
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      dispatch(setTotalDays(totalDays));
    }
  }, [selectedEvent, dispatch]);

  useEffect(() => {
    dispatch(setApplyToAllDays(false));
  }, [dispatch]);

  const [isListLoading, setIsListLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [loadingMealIds, setLoadingMealIds] = useState(new Set());
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const refreshMealList = () => {
    setIsListLoading(true);
    dispatch(fetchMeals()).finally(() => setIsListLoading(false));
  };

  useEffect(() => {
    refreshMealList();
  }, [dispatch]);

  const handleAddMealCategory = (categoryName) => {
    if (!categoryName.trim()) return;

    const selectedDay = days.find((day) => day.id === selectedDayId);
    if (!selectedDay?.date) return;

    setIsAddingMeal(true);

    if (applyToAllDays) {
      dispatch(postMealCategory(categoryName.trim()))
        .then((response) => {
          if (response?.message) {
            setSuccessMessage(response.message);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
          }
          refreshMealList();
        })
        .catch((error) => {
          setErrorMessage(error.message || 'Failed to add meal category');
          setShowError(true);
          setTimeout(() => setShowError(false), 2000);
        })
        .finally(() => setIsAddingMeal(false));
    } else {
      dispatch(postMealCategoryForDate(categoryName.trim(), selectedDay.date))
        .then((response) => {
          if (response?.message) {
            setSuccessMessage(response.message);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
          }
          refreshMealList();
        })
        .catch((error) => {
          setErrorMessage(error.message || 'Failed to add meal category');
          setShowError(true);
          setTimeout(() => setShowError(false), 2000);
        })
        .finally(() => setIsAddingMeal(false));
    }
  };

  const handleRemoveMealCategory = (dayId, mealId, date) => {
    if (!date) return;

    setLoadingMealIds((prev) => new Set([...prev, mealId]));

    dispatch(postRemoveMealCategory(mealId, date))
      .then(() => refreshMealList())
      .finally(() => {
        setLoadingMealIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(mealId);
          return newSet;
        });
      });
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

  // Error Popup Component
  const ErrorPopup = () => {
    if (!showError) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 flex items-start gap-3 z-50"
        >
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-500 text-lg">!</span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Error</h4>
            <p className="text-gray-600">{errorMessage}</p>
          </div>
          <button
            onClick={() => setShowError(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <IoClose size={20} />
          </button>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Add Success Popup Component
  const SuccessPopup = () => {
    if (!showSuccess) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 flex items-start gap-3 z-50"
        >
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-500 text-lg">✓</span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Success</h4>
            <p className="text-gray-600">{successMessage}</p>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <IoClose size={20} />
          </button>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Add this useEffect to set the first day as selected when component mounts
  useEffect(() => {
    if (days && days.length > 0) {
      dispatch(setSelectedDay(days[0].id));
    }
  }, [days, dispatch]);

  // Add this useEffect for cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Reset selected day when component unmounts
      dispatch(setSelectedDay(null));
    };
  }, [dispatch]);

  // Helper function to format date (add this near the top of the component)
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // This will format as dd/mm/yyyy
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row w-full gap-4 meal-sec-main">
      {/* Left Section - Daily Meal Overview */}
      <div className="w-full lg:w-1/2 bg-white rounded-lg meal-sec meal-sec-left ">
        <h2 className="text-xl font-semibold mb-4 lg:mb-6 text-gray-800">
          Daily Meal Overview
        </h2>

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
          {Array.isArray(days) &&
            days.map((day) => (
              <div
                key={`day-${day.id}`}
                className={`border rounded-lg p-4 relative ${
                  selectedDayId === day.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : ''
                }`}
                onClick={() => handleDaySelection(day.id)}
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Day {day.id}</h3>
                    <span className="text-sm text-gray-500">
                      {formatDisplayDate(day.date)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {day.meals.map((meal) => (
                    <div key={`meal-${day.id}-${meal.id}`} className="relative">
                      <div className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors flex justify-between items-center">
                        <span className="font-medium">{meal.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {meal.items?.length || 0} items
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMealCategory(
                                day.id,
                                meal.id,
                                day.date
                              );
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={loadingMealIds.has(meal.id)}
                          >
                            {loadingMealIds.has(meal.id) ? (
                              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            ) : (
                              <IoMdClose size={20} />
                            )}
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
      <div className="w-full lg:w-1/2 bg-black rounded-lg p-4 lg:p-6 shadow-md meal-sec-right">
        <h2 className="text-xl font-semibold mb-4 lg:mb-6 text-white">
          Add Meal Category {selectedDayId ? `for Day ${selectedDayId}` : ''}
          {!applyToAllDays &&
            selectedDayId &&
            days.find((d) => d.id === selectedDayId)?.date && (
              <span className="block text-sm text-gray-400">
                Date:{' '}
                {formatDisplayDate(
                  days.find((d) => d.id === selectedDayId).date
                )}
              </span>
            )}
        </h2>

        <div className="flex gap-2 mb-6 add-cat-sec relative">
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
              const input = document.querySelector(
                'input[placeholder="Meal Category"]'
              );
              const value = input?.value?.trim();

              if (!value) {
                setErrorMessage('Please enter a meal category');
                setShowError(true);
                setTimeout(() => setShowError(false), 2000);
                return;
              }

              handleAddMealCategory(value);
              input.value = '';
              setShowError(false);
            }}
            disabled={isAddingMeal}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {isAddingMeal ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              'Add'
            )}
          </button>
        </div>
      </div>
      <ErrorPopup />
      <SuccessPopup />
    </div>
  );
};

export default AdminEventFood;
