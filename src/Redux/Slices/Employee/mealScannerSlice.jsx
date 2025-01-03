// src/Redux/Slices/Employee/mealScannerSlice.js
import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import axiosInstance from '../../../axiosConfig';
import { websocketService } from '../../../services/websocketService';

const initialState = {
  mealCounts: {},
  days: [],
  status: 'idle',
  error: null,
  selectedMeals: {},
  scannerOpen: false,
  currentScanningMeal: null,
  scanStatus: 'idle',
};

export const getDays = createAsyncThunk(
  'mealScanner/getDays',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/no-event-days-emp');

      if (!response?.data?.data?.length) {
        return rejectWithValue('No events found. Please check back later.');
      }

      if (!response?.data?.data?.[0]?.event_dates_with_meals) {
        return rejectWithValue(
          'No meals are currently scheduled. Please contact your administrator.'
        );
      }

      const eventData = response.data.data[0];
      const daysData = eventData.event_dates_with_meals;

      const transformedDays = Object.entries(daysData).map(
        ([dayKey, dayData]) => ({
          id: dayKey,
          name: dayKey,
          date: dayData.date,
          mealCategories: Array.isArray(dayData.meals)
            ? dayData.meals.map((meal) => ({
                id: `meal-${Math.random()}`,
                name: meal,
                status: 'pending',
                date: dayData.date,
              }))
            : [],
          isOpen: false,
        })
      );

      return {
        eventName: eventData.event_name || 'Unnamed Event',
        days: transformedDays,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Unable to load meal schedule. Please try again later or contact support.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const scanMeal = createAsyncThunk(
  'mealScanner/scanMeal',
  async (scanData, { dispatch }) => {
    try {
      const response = await axiosInstance.post('/scan-meal/', {
        meal_type: scanData.mealCategory,
        date: scanData.date,
      });

      if (response.data?.success) {
        const wsMessage = {
          type: 'meal_scanned',
          meal_type: scanData.mealCategory,
          new_count: response.data?.data?.count || 0,
          timestamp: new Date().toISOString(),
        };

        if (
          websocketService.ws &&
          websocketService.ws.readyState === WebSocket.OPEN
        ) {
          websocketService.ws.send(JSON.stringify(wsMessage));
        }
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

const mealScannerSlice = createSlice({
  name: 'mealScanner',
  initialState,
  reducers: {
    updateMealCount: (state, action) => {
      const { meal_type, new_count } = action.payload;
      state.mealCounts[meal_type.toLowerCase()] = new_count;
    },
    toggleDay: (state, action) => {
      const dayId = action.payload;
      if (state.days && Array.isArray(state.days)) {
        state.days = state.days.map((day) => ({
          ...day,
          isOpen: day.id === dayId ? !day.isOpen : false,
        }));
      }
    },
    toggleScanner: (state, action) => {
      const { isOpen, mealInfo } = action.payload;
      state.scannerOpen = isOpen;
      state.currentScanningMeal = mealInfo;
    },
    selectMeal: (state, action) => {
      const { dayId, selectedCategories } = action.payload;
      state.selectedMeals[dayId] = selectedCategories;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDays.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getDays.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.eventName = action.payload.eventName;
        state.days = action.payload.days;
        state.error = null;
      })
      .addCase(getDays.rejected, (state, action) => {
        state.status = 'failed';
        state.error = {
          message: action.payload || 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
          code: 'MEAL_FETCH_ERROR',
        };
        state.days = [];
        state.eventName = null;
      });
  },
});

export const { updateMealCount, toggleDay, toggleScanner, selectMeal } =
  mealScannerSlice.actions;
export default mealScannerSlice.reducer;
