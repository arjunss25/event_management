import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk to fetch event details (single event)
export const fetchEventDetails = createAsyncThunk(
  'adminEvents/fetchEventDetails',
  async () => {
    try {
      const response = await axios.get('/src/utils/adminEventData.json');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

// Thunk to fetch all admin events
export const fetchAdminEvents = createAsyncThunk(
  'adminEvents/fetchEvents',
  async () => {
    try {
      const response = await axios.get('/src/utils/adminEventsData.json');
      // Wrap the single event in an array if it's not already an array
      const events = Array.isArray(response.data) ? response.data : [response.data];
      return events;
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
    clearEventDetails: (state) => {
      state.selectedEvent = null;
    },
    updateEventDetails: (state, action) => {
      state.selectedEvent = { ...state.selectedEvent, ...action.payload };
      // Also update the event in the events array if it exists
      if (state.events.length > 0) {
        const index = state.events.findIndex(event => event.id === state.selectedEvent.id);
        if (index !== -1) {
          state.events[index] = { ...state.events[index], ...action.payload };
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchEventDetails
      .addCase(fetchEventDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEvent = action.payload;
        state.error = null;
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Handle fetchAdminEvents
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
      });
  },
});

export const { clearEventDetails, updateEventDetails } = AdminEventsSlice.actions;
export default AdminEventsSlice.reducer;