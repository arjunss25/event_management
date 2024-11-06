import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  days: [{
    id: 1,
    meals: [
      { id: 'breakfast', name: 'Breakfast', items: [], order: 1 },
      { id: 'lunch', name: 'Lunch', items: [], order: 2 },
      { id: 'dinner', name: 'Dinner', items: [], order: 3 }
    ]
  }],
  selectedDayId: 1,
  applyToAllDays: false,
  totalDays: 1
};

const eventFoodSlice = createSlice({
  name: 'eventFood',
  initialState,
  reducers: {
    addDay: (state) => {
      const newDayId = state.days.length + 1;
      if (newDayId <= state.totalDays) {
        state.days.push({
          id: newDayId,
          meals: [
            { id: `breakfast-${newDayId}`, name: 'Breakfast', items: [], order: 1 },
            { id: `lunch-${newDayId}`, name: 'Lunch', items: [], order: 2 },
            { id: `dinner-${newDayId}`, name: 'Dinner', items: [], order: 3 }
          ]
        });
      }
    },
    
    removeDay: (state, action) => {
      const dayIdToRemove = action.payload;
      state.days = state.days.filter(day => day.id !== dayIdToRemove);
      // Reset selected day if it was removed
      if (state.selectedDayId === dayIdToRemove) {
        state.selectedDayId = state.days[0]?.id || null;
      }
    },

    setSelectedDay: (state, action) => {
      state.selectedDayId = action.payload;
    },
    
    setTotalDays: (state, action) => {
      state.totalDays = action.payload;
    },
    
    addMealCategory: (state, action) => {
      const { dayId, categoryName } = action.payload;
      const newMeal = {
        id: `${categoryName.toLowerCase().replace(/\s+/g, '-')}-${dayId}`,
        name: categoryName,
        items: [],
        order: state.days.find(d => d.id === dayId).meals.length + 1
      };
      
      if (state.applyToAllDays) {
        state.days.forEach(day => {
          day.meals.push({
            ...newMeal,
            id: `${categoryName.toLowerCase().replace(/\s+/g, '-')}-${day.id}`
          });
        });
      } else {
        const targetDay = state.days.find(d => d.id === dayId);
        if (targetDay) {
          targetDay.meals.push(newMeal);
        }
      }
    },
    
    removeMealCategory: (state, action) => {
      const { dayId, mealId } = action.payload;
      const day = state.days.find(d => d.id === dayId);
      if (day) {
        day.meals = day.meals.filter(meal => meal.id !== mealId);
      }
    },
    
    setApplyToAllDays: (state, action) => {
      state.applyToAllDays = action.payload;
      if (action.payload && state.days.length === 1) {
        const firstDayMeals = [...state.days[0].meals];
        while (state.days.length < state.totalDays) {
          const newDayId = state.days.length + 1;
          state.days.push({
            id: newDayId,
            meals: firstDayMeals.map(meal => ({
              ...meal,
              id: `${meal.id.split('-')[0]}-${newDayId}`
            }))
          });
        }
      }
    },
    
    resetEventFood: () => initialState
  }
});

export const selectEventFoodState = state => state.eventFood || { days: [], applyToAllDays: false };

export const selectDays = createSelector(
  [selectEventFoodState],
  eventFood => eventFood.days
);

export const selectApplyToAllDays = createSelector(
  [selectEventFoodState],
  eventFood => eventFood.applyToAllDays
);

export const selectSelectedDayId = createSelector(
  [selectEventFoodState],
  eventFood => eventFood.selectedDayId
);

export const {
  addDay,
  removeDay,
  setSelectedDay,
  setTotalDays,
  addMealCategory,
  removeMealCategory,
  setApplyToAllDays,
  resetEventFood
} = eventFoodSlice.actions;

export default eventFoodSlice.reducer;