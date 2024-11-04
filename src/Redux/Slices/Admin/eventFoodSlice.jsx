// src/store/slices/admin/eventFoodSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  days: [],
  selectedMeal: null,
  applyToAllDays: false,
};

const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const differenceInTime = end.getTime() - start.getTime();
  return Math.ceil(differenceInTime / (1000 * 3600 * 24)) + 1;
};

const getDefaultMeals = () => [
  { id: 'breakfast', name: 'Breakfast', items: [], order: 1 },
  { id: 'lunch', name: 'Lunch', items: [], order: 2 },
  { id: 'dinner', name: 'Dinner', items: [], order: 3 }
];

const eventFoodSlice = createSlice({
  name: 'eventFood',
  initialState,
  reducers: {
    initializeDays: (state, action) => {
      const { startDate, endDate } = action.payload;
      const numberOfDays = calculateDays(startDate, endDate);
      state.days = Array.from({ length: numberOfDays }, (_, index) => ({
        id: index + 1,
        meals: getDefaultMeals()
      }));
    },
    
    addMealCategory: (state, action) => {
      const { dayId, categoryName } = action.payload;
      const day = state.days.find(d => d.id === dayId);
      if (day) {
        const newMeal = {
          id: categoryName.toLowerCase().replace(/\s+/g, '-'),
          name: categoryName,
          items: [],
          order: day.meals.length + 1
        };
        
        if (state.applyToAllDays) {
          state.days.forEach(d => {
            d.meals.push({ ...newMeal });
          });
        } else {
          day.meals.push(newMeal);
        }
      }
    },
    
    removeMealCategory: (state, action) => {
      const { dayId, mealId } = action.payload;
      const day = state.days.find(d => d.id === dayId);
      if (day) {
        day.meals = day.meals.filter(meal => meal.id !== mealId);
        day.meals.forEach((meal, index) => {
          meal.order = index + 1;
        });
      }
    },
    
    reorderMeals: (state, action) => {
      const { dayId, oldIndex, newIndex } = action.payload;
      const day = state.days.find(d => d.id === dayId);
      if (day) {
        const meal = day.meals[oldIndex];
        day.meals.splice(oldIndex, 1);
        day.meals.splice(newIndex, 0, meal);
        day.meals.forEach((meal, index) => {
          meal.order = index + 1;
        });
      }
    },
    
    setApplyToAllDays: (state, action) => {
      state.applyToAllDays = action.payload;
    },
    
    copyDayToAll: (state, action) => {
      const { sourceDayId } = action.payload;
      const sourceDay = state.days.find(d => d.id === sourceDayId);
      if (sourceDay) {
        const mealsToCopy = JSON.parse(JSON.stringify(sourceDay.meals));
        state.days.forEach(day => {
          if (day.id !== sourceDayId) {
            day.meals = mealsToCopy;
          }
        });
      }
    },
    
    resetEventFood: () => initialState
  }
});

export const {
  initializeDays,
  addMealCategory,
  removeMealCategory,
  reorderMeals,
  setApplyToAllDays,
  copyDayToAll,
  resetEventFood
} = eventFoodSlice.actions;

// Updated selectors with safe navigation
export const selectDays = (state) => state?.admin?.eventFood?.days ?? [];
export const selectApplyToAllDays = (state) => state?.admin?.eventFood?.applyToAllDays ?? false;

export default eventFoodSlice.reducer;