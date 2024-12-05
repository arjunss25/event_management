// src/Redux/Slices/Employee/mealScannerSlice.js
import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../../axiosConfig';
import { websocketService } from '../../../services/websocketService';

export const getDays = createAsyncThunk(
  'mealScanner/getDays',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/no-event-days-emp');

      if (!response?.data?.data?.[0]?.event_dates_with_meals) {
        console.error('Invalid API response structure:', response);
        return rejectWithValue('Invalid or missing data structure');
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
      console.error('API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const scanMeal = createAsyncThunk(
  'mealScanner/scanMeal',
  async (scanData, { rejectWithValue }) => {
    try {
      // Assuming you have an API endpoint for recording scans
      const response = await axiosInstance.post('/scan-meal/', {
        meal_type: scanData.mealCategory,
        date: scanData.date,
        // Add any other required data
      });

      // Send WebSocket message to update dashboard
      const wsMessage = {
        type: 'meal_scanned',
        meal_type: scanData.mealCategory,
      };

      // Notify all WebSocket subscribers (including dashboard)
      websocketService.notifySubscribers(wsMessage);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  days: [],
  selectedMeals: {},
  status: 'idle',
  error: null,
  scannerOpen: false,
  currentScanningMeal: null,
  scanStatus: 'idle',
};

const mealScannerSlice = createSlice({
  name: 'mealScanner',
  initialState,
  reducers: {
    toggleDay: (state, action) => {
      const dayId = action.payload;
      if (state.days && Array.isArray(state.days)) {
        state.days = state.days.map((day) => ({
          ...day,
          isOpen: day.id === dayId ? !day.isOpen : false,
        }));
      }
    },
    selectMeal: (state, action) => {
      const { dayId, selectedCategories } = action.payload;
      state.selectedMeals[dayId] = selectedCategories;
    },
    toggleScanner: (state, action) => {
      const { isOpen, mealInfo } = action.payload;
      state.scannerOpen = isOpen;
      state.currentScanningMeal = mealInfo;
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
        state.error = action.payload || 'Failed to fetch meal data';
        state.days = [];
        state.eventName = null;
      })
      .addCase(scanMeal.pending, (state) => {
        state.scanStatus = 'loading';
      })
      .addCase(scanMeal.fulfilled, (state) => {
        state.scanStatus = 'succeeded';
      })
      .addCase(scanMeal.rejected, (state, action) => {
        state.scanStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { toggleDay, selectMeal, toggleScanner } =
  mealScannerSlice.actions;
export default mealScannerSlice.reducer;
