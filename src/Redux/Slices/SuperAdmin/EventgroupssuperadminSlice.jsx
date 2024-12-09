import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../axiosConfig';

export const fetchEvents = createAsyncThunk(
  'eventgroups/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/list-all-eventgroups/');
      const eventData = response.data?.data || response.data || [];
      return eventData;
    } catch (error) {
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
      const response = await axiosInstance.delete('/list-all-eventgroups/', {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          id: id,
        },
      });

      if (response.status === 204 || response.status === 200) {
        return id;
      } else {
        throw new Error('Unexpected response status: ' + response.status);
      }
    } catch (error) {
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }

      if (error.response?.status === 404) {
        return rejectWithValue('Event group not found');
      } else if (error.response?.status === 400) {
        return rejectWithValue('Invalid event group ID provided');
      } else if (error.response?.status === 403) {
        return rejectWithValue(
          'You do not have permission to delete this event group'
        );
      }

      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete event'
      );
    }
  }
);

// Add new thunk for fetching single event group
export const fetchEventGroupById = createAsyncThunk(
  'eventgroups/fetchEventGroupById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/list-eventgroup-by-id/${id}/`);
      if (response.status === 200 && response.data.status === "Success") {
        return response.data.data;
      }
      throw new Error('Failed to fetch event group');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add new thunk for updating event group
export const updateEventGroup = createAsyncThunk(
  'eventgroups/updateEventGroup',
  async ({ id, data }, { dispatch }) => {
    try {
      const updateResponse = await axiosInstance.put(`/list-eventgroup-by-id/${id}/`, data);
      
      if (updateResponse.status === 200) {
        // After successful update, fetch the latest data
        const getResponse = await axiosInstance.get(`/list-eventgroup-by-id/${id}/`);
        
        if (getResponse.status === 200 && getResponse.data.status === "Success") {
          return getResponse.data.data; // Return the fresh data
        }
      }
      throw new Error('Update failed');
    } catch (error) {
      throw error;
    }
  }
);

const EventgroupssuperadminSlice = createSlice({
  name: 'eventgroups',
  initialState: {
    events: [],
    currentEventGroup: null,
    loading: false,
    error: null,
    deleteError: null,
    deleteLoading: false,
    updateLoading: false,
    updateError: null,
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.deleteError = null;
      state.updateError = null;
    },
    clearCurrentEventGroup: (state) => {
      state.currentEventGroup = null;
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
        state.events = state.events.filter(
          (event) => event.id !== action.payload
        );
        state.deleteError = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || 'Failed to delete event';
      })
      .addCase(fetchEventGroupById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventGroupById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEventGroup = action.payload;
        state.error = null;
      })
      .addCase(fetchEventGroupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateEventGroup.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateEventGroup.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.currentEventGroup = action.payload;
        // Also update the event in the events array
        const index = state.events.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        state.updateError = null;
      })
      .addCase(updateEventGroup.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { clearErrors, clearCurrentEventGroup } =
  EventgroupssuperadminSlice.actions;
export default EventgroupssuperadminSlice.reducer;
