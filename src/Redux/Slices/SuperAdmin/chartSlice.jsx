import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import chartData from '../../../utils/chartData.json'; // Assuming this is where the chart data is stored

// Simulate fetching data with a slight delay
const fetchChartData = async (year) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  return chartData[year] || []; // Return chart data for the selected year, or empty array if not found
};

export const getChartData = createAsyncThunk(
  'chart/getChartData',
  async (year) => {
    const response = await fetchChartData(year);
    console.log('Fetched Data:', response); // Debug log to check fetched data
    return response; // Ensure this is returning the correct structure (an array of data objects)
  }
);

const initialState = {
  data: [], // Holds the actual chart data
  loading: false, // Tracks loading state
  error: null, // Tracks error state
  selectedYear: '2024', // Default year
  availableYears: Object.keys(chartData).sort().reverse() // Sort years in descending order
};

const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload; // Set selected year
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChartData.pending, (state) => {
        state.loading = true; // Set loading to true while fetching
        state.error = null; // Clear error
      })
      .addCase(getChartData.fulfilled, (state, action) => {
        state.loading = false; // Set loading to false once data is fetched
        state.data = action.payload; // Store the fetched chart data in the state
      })
      .addCase(getChartData.rejected, (state, action) => {
        state.loading = false; // Set loading to false if fetching fails
        state.error = action.error.message; // Set error message
      });
  },
});

const selectChartState = (state) => state.superadmin?.chart || initialState;

export const selectChartData = createSelector(
  [selectChartState],
  (chartState) => chartState.data // Select chart data from state
);

export const selectChartMetadata = createSelector(
  [selectChartState],
  (chartState) => ({
    selectedYear: chartState.selectedYear,
    availableYears: chartState.availableYears
  })
);

export const selectChartStatus = createSelector(
  [selectChartState],
  (chartState) => ({
    loading: chartState.loading,
    error: chartState.error
  })
);

export const { setSelectedYear } = chartSlice.actions;
export default chartSlice.reducer;