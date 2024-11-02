import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk to fetch all admin events
export const fetchAdminEvents = createAsyncThunk(
  'adminEvents/fetchEvents',
  async () => {
    try {
      const response = await axios.get('/src/utils/adminEventsData.json'); // Adjust path as necessary
      return response.data.events; // Ensure this matches your JSON structure
    } catch (error) {
      throw error;
    }
  }
);

// Thunk to fetch a single event by ID
export const fetchSingleEvent = createAsyncThunk(
  'adminEvents/fetchSingleEvent',
  async (id) => {
    try {
      const response = await axios.get('/src/utils/adminEventsData.json'); // Adjust path as necessary

      const event = response.data.events.find((event) => event.id.toString() === id); // Ensure ID comparison is type-safe
      return event || null; // Return null if not found
    } catch (error) {
      throw error;
    }
  }
);

// Create the admin events slice
const AdminEventsSlice = createSlice({
  name: 'adminEvents',
  initialState: {
    events: [],
    selectedEvent: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all events
      .addCase(fetchAdminEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
        state.error = null;
      })
      .addCase(fetchAdminEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch a single event
      .addCase(fetchSingleEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEvent = action.payload; // Set the selected event
        state.error = null;
      })
      .addCase(fetchSingleEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Export actions and reducer
export const { clearSelectedEvent } = AdminEventsSlice.actions;
export default AdminEventsSlice.reducer;
