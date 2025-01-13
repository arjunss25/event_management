import { createSlice, createSelector } from '@reduxjs/toolkit';
import axiosInstance from '../../../axiosConfig';

const initialState = {
  days: [],
  selectedDayId: 1,
  applyToAllDays: false,
  totalDays: 1,
  loading: false,
  error: null,
};

const eventFoodSlice = createSlice({
  name: 'eventFood',
  initialState,
  reducers: {
    fetchMealsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMealsSuccess: (state, action) => {
      state.loading = false;
      state.days = action.payload;
    },
    fetchMealsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addDay: (state) => {
      const newDayId = state.days.length + 1;
      if (newDayId <= state.totalDays) {
        state.days.push({
          id: newDayId,
          meals: [
            {
              id: `breakfast-${newDayId}`,
              name: 'Breakfast',
              items: [],
              order: 1,
            },
            { id: `lunch-${newDayId}`, name: 'Lunch', items: [], order: 2 },
            { id: `dinner-${newDayId}`, name: 'Dinner', items: [], order: 3 },
          ],
        });
      }
    },

    removeDay: (state, action) => {
      const dayIdToRemove = action.payload;
      state.days = state.days.filter((day) => day.id !== dayIdToRemove);
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
        order: state.days.find((d) => d.id === dayId).meals.length + 1,
      };

      if (state.applyToAllDays) {
        state.days.forEach((day) => {
          day.meals.push({
            ...newMeal,
            id: `${categoryName.toLowerCase().replace(/\s+/g, '-')}-${day.id}`,
          });
        });
      } else {
        const targetDay = state.days.find((d) => d.id === dayId);
        if (targetDay) {
          targetDay.meals.push(newMeal);
        }
      }
    },

    removeMealCategory: (state, action) => {
      const { dayId, mealId } = action.payload;
      const day = state.days.find((d) => d.id === dayId);
      if (day) {
        day.meals = day.meals.filter((meal) => meal.id !== mealId);
      }
    },

    updateApplyToAllDays: (state, action) => {
      state.applyToAllDays = action.payload;
    },

    resetEventFood: () => initialState,

    addMealCategoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addMealCategorySuccess: (state, action) => {
      state.loading = false;
      // You might want to update the state with the new meal if needed
    },
    addMealCategoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    applyToAllDaysStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    applyToAllDaysSuccess: (state) => {
      state.loading = false;
      state.applyToAllDays = true;
    },
    applyToAllDaysFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    removeMealCategoryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    removeMealCategorySuccess: (state) => {
      state.loading = false;
    },
    removeMealCategoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const selectEventFoodState = (state) =>
  state.eventFood || { days: [], applyToAllDays: false };

export const selectDays = createSelector(
  [selectEventFoodState],
  (eventFood) => eventFood.days
);

export const selectApplyToAllDays = createSelector(
  [selectEventFoodState],
  (eventFood) => eventFood.applyToAllDays
);

export const selectSelectedDayId = createSelector(
  [selectEventFoodState],
  (eventFood) => eventFood.selectedDayId
);

export const selectMealsLoading = createSelector(
  [selectEventFoodState],
  (eventFood) => eventFood.loading
);

export const selectMealsError = createSelector(
  [selectEventFoodState],
  (eventFood) => eventFood.error
);

export const {
  fetchMealsStart,
  fetchMealsSuccess,
  fetchMealsFailure,
  addDay,
  removeDay,
  setSelectedDay,
  setTotalDays,
  addMealCategory,
  removeMealCategory,
  updateApplyToAllDays,
  resetEventFood,
  addMealCategoryStart,
  addMealCategorySuccess,
  addMealCategoryFailure,
  applyToAllDaysStart,
  applyToAllDaysSuccess,
  applyToAllDaysFailure,
  removeMealCategoryStart,
  removeMealCategorySuccess,
  removeMealCategoryFailure,
} = eventFoodSlice.actions;

export const fetchMeals = () => async (dispatch) => {
  try {
    dispatch(fetchMealsStart());
    const response = await axiosInstance.get('/allocated-meals-list/');

    const transformedData = response.data.data.map((day, index) => ({
      id: index + 1,
      date: day.date,
      meals: day.meal_types.map((meal) => ({
        id: meal.id || `meal-${Math.random()}`,
        name: meal.name,
        items: [],
      })),
    }));

    dispatch(fetchMealsSuccess(transformedData));
  } catch (error) {
    dispatch(fetchMealsFailure(error.message));
  }
};

export const postMealCategory = (mealName) => async (dispatch) => {
  try {
    dispatch(addMealCategoryStart());
    await axiosInstance.post('/meal-allocation/', {
      name: mealName,
    });
    dispatch(addMealCategorySuccess());
  } catch (error) {
    dispatch(addMealCategoryFailure(error.message));
  }
};

export const applyMealPlanToAllDays = () => async (dispatch) => {
  try {
    dispatch(applyToAllDaysStart());
    await axiosInstance.post('/apply-mealplan-to-all-dates/');
    dispatch(applyToAllDaysSuccess());

    dispatch(fetchMeals());
  } catch (error) {
    dispatch(applyToAllDaysFailure(error.message));
  }
};

export const setApplyToAllDays = (value) => async (dispatch) => {
  if (value) {
    dispatch(applyMealPlanToAllDays());
  } else {
    dispatch(updateApplyToAllDays(false));
  }
};

export const postMealCategoryForDate = (mealName, date) => async (dispatch) => {
  try {
    dispatch(addMealCategoryStart());
    const response = await axiosInstance.post('/meal-allocated-for-date/', {
      name: mealName,
      date: date,
    });
    dispatch(addMealCategorySuccess());
    return response.data;
  } catch (error) {
    dispatch(addMealCategoryFailure(error.message));
    throw error;
  }
};

export const postRemoveMealCategory =
  (mealTypeId, date) => async (dispatch) => {
    try {
      dispatch(removeMealCategoryStart());
      await axiosInstance.post('/remove-meal-type/', {
        meal_type_id: mealTypeId,
        date: date,
      });
      dispatch(removeMealCategorySuccess());
    } catch (error) {
      dispatch(removeMealCategoryFailure(error.message));
    }
  };

export default eventFoodSlice.reducer;
