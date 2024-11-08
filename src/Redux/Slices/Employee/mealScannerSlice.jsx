// src/Redux/Slices/Employee/mealScannerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getDays = createAsyncThunk(
  'mealScanner/getDays',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('src/utils/mealcategory.json');
      if (!response.data || !response.data.days) {
        throw new Error('Invalid data structure received');
      }
      return response.data.days;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  days: [],
  selectedMeals: {},
  status: 'idle',
  error: null,
};

const mealScannerSlice = createSlice({
  name: 'mealScanner',
  initialState,
  reducers: {
    toggleDay: (state, action) => {
      const dayId = action.payload;
      if (state.days && Array.isArray(state.days)) {
        state.days = state.days.map(day => ({
          ...day,
          isOpen: day.id === dayId ? !day.isOpen : false
        }));
      }
    },
    selectMeal: (state, action) => {
      const { dayId, selectedCategories } = action.payload;
      state.selectedMeals[dayId] = selectedCategories;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDays.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getDays.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Ensure action.payload is an array before mapping
        if (Array.isArray(action.payload)) {
          state.days = action.payload.map(day => ({
            ...day,
            isOpen: false,
            name: day.day
          }));
        } else {
          state.error = 'Invalid data format received';
        }
      })
      .addCase(getDays.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch days';
      });
  }
});

export const { toggleDay, selectMeal } = mealScannerSlice.actions;
export default mealScannerSlice.reducer;