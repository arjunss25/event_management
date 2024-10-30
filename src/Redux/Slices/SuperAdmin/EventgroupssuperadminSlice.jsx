import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchEvents = createAsyncThunk(
  'eventgroups/fetchEvents',
  async () => {
    try {
      const response = await axios.get('src/utils/eventgroupsDataSuperadmin.json');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'eventgroups/deleteEvent',
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

const EventgroupssuperadminSlice = createSlice({
  name: 'eventgroups',
  initialState: {
    events: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(event => event.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default EventgroupssuperadminSlice.reducer;