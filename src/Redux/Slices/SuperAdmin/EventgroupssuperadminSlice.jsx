import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../axiosConfig';

export const fetchEvents = createAsyncThunk(
  'eventgroups/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/list-all-eventgroups/');
      console.log('Full API Response:', response);
      const eventData = response.data?.data || response.data || [];
      return eventData;
    } catch (error) {
      console.error('Fetch Error Details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
      });
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to fetch events'
      );
    }
  }
);




export const deleteEvent = createAsyncThunk(
  'eventgroups/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      console.log('Attempting to delete event with ID:', id);

   
      const response = await axiosInstance.delete('/list-all-eventgroups/', {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          ids: [id], 
        },
      });

      console.log('Delete Response:', response);

      if (response.status === 204 || response.status === 200) {
        return id;
      } else {
        throw new Error('Unexpected response status: ' + response.status);
      }
    } catch (error) {
      console.error('Delete Error Details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
      });

     
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }

      
      if (error.response?.status === 404) {
        return rejectWithValue('Event group not found');
      } else if (error.response?.status === 400) {
        return rejectWithValue('Invalid event group ID provided');
      } else if (error.response?.status === 403) {
        return rejectWithValue('You do not have permission to delete this event group');
      }

      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Failed to delete event'
      );
    }
  }
);


const EventgroupssuperadminSlice = createSlice({
  name: 'eventgroups',
  initialState: {
    events: [],
    loading: false,
    error: null,
    deleteError: null,
    deleteLoading: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch events';
        state.events = [];
      })
      .addCase(deleteEvent.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.events = state.events.filter(event => event.id !== action.payload);
        state.deleteError = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || 'Failed to delete event';
      });
  },
});

export const { clearErrors } = EventgroupssuperadminSlice.actions;
export default EventgroupssuperadminSlice.reducer;
