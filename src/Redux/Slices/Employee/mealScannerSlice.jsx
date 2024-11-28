// src/Redux/Slices/Employee/mealScannerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Add mock data
const mockDays = [
  {
    id: 1,
    day: "Day 1",
    mealCategories: ["Breakfast", "Lunch", "Dinner"]
  },
  {
    id: 2,
    day: "Day 2",
    mealCategories: ["Breakfast", "Lunch", "Dinner"]
  },
  {
    id: 3,
    day: "Day 3",
    mealCategories: ["Breakfast", "Lunch", "Dinner"]
  }
];

export const getDays = createAsyncThunk(
  'mealScanner/getDays',
  async (_, { rejectWithValue }) => {
    try {
      // For now, return mock data instead of making an API call
      return mockDays;
      
      // Later, when your API is ready, you can uncomment this:
      // const response = await axios.get('your-api-endpoint/meals');
      // return response.data;
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