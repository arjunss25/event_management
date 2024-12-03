import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../axiosConfig';

// Thunk to fetch event details (single event)
export const fetchEventDetails = createAsyncThunk(
  'adminEvents/fetchEventDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/event-details`);

      return {
        id: response.data.data.id,
        eventName: response.data.data.event_name,
        startDate: response.data.data.start_date,
        endDate: response.data.data.end_date,
        venue: response.data.data.venue || '',
        paymentStatus: response.data.data.payment_status,
        totalAmount: response.data.data.total_amount,
        seatsBooked: response.data.data.seats_booked,
        eventStatus: response.data.data.event_status,
        image: response.data.data.image,
        eventGroupName: response.data.data.event_group_name,
        eventGroupEmail: response.data.data.event_group_email,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch event details'
      );
    }
  }
);

// Thunk to update event details
export const updateEventDetails = createAsyncThunk(
  'adminEvents/updateEventDetails',
  async (eventData, { getState, dispatch, rejectWithValue }) => {
    try {
      const { selectedEvent } = getState().adminEvents;

      if (!selectedEvent) {
        throw new Error('No event selected');
      }

      const response = await axiosInstance.put(`/event-details/`, {
        venue: eventData.venue,
        seats_booked: eventData.seatsBooked,
        total_amount: eventData.totalAmount,
        payment_status: eventData.paymentStatus,
      });

      // Return the complete updated data
      return {
        venue: eventData.venue,
        seatsBooked: eventData.seatsBooked,
        totalAmount: eventData.totalAmount,
        paymentStatus: eventData.paymentStatus,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update event details'
      );
    }
  }
);

// Thunk to fetch all admin events
export const fetchAdminEvents = createAsyncThunk(
  'adminEvents/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/events');

      // Map API response to expected format
      return response.data.data.map((event) => ({
        id: event.id,
        eventName: event.event_name,
        startDate: event.start_date,
        endDate: event.end_date,
        venue: event.venue || '',
        paymentStatus: event.total_amount ? 'Completed' : 'Pending',
        seatsBooked: event.seats_booked || 0,
        eventStatus: event.event_status,
      }));
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch events'
      );
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
        state.error = action.payload || 'Failed to fetch event details';
      })
      // Handle updateEventDetails
      .addCase(updateEventDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEventDetails.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedEvent) {
          state.selectedEvent = {
            ...state.selectedEvent,
            ...action.payload,
          };
        }
        state.error = null;
      })
      .addCase(updateEventDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update event details';
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
        state.error = action.payload || 'Failed to fetch events';
      });
  },
});

export const { clearEventDetails } = AdminEventsSlice.actions;
export default AdminEventsSlice.reducer;
