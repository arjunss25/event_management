import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching events
export const fetchAdminEvents = createAsyncThunk(
  'adminEvents/fetchEvents',
  async () => {
    try {
      const response = await axios.get('src/utils/adminEventsData.json');
      return response.data.events;
    } catch (error) {
      throw error;
    }
  }
);

// Async thunk for updating event status
export const updateEventStatus = createAsyncThunk(
  'adminEvents/updateStatus',
  async ({ id, status }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id, status };
    } catch (error) {
      throw error;
    }
  }
);

// Async thunk for deleting event
export const deleteAdminEvent = createAsyncThunk(
  'adminEvents/deleteEvent',
  async (id) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return id;
    } catch (error) {
      throw error;
    }
  }
);

const AdminEventsSlice = createSlice({
  name: 'adminEvents',
  initialState: {
    events: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch events cases
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
      
      // Update status cases
      .addCase(updateEventStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEventStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, status } = action.payload;
        const event = state.events.find(event => event.id === id);
        if (event) {
          event.eventStatus = status;
        }
        state.error = null;
      })
      .addCase(updateEventStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Delete event cases
      .addCase(deleteAdminEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(event => event.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteAdminEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default AdminEventsSlice.reducer;