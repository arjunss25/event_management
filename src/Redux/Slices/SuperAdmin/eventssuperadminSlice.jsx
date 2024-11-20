import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../axiosConfig';

// Existing thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/list-all-events/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch events');
    }
  }
);

// New thunk for fetching events by event group ID
export const fetchEventsByGroupId = createAsyncThunk(
  'events/fetchEventsByGroupId',
  async (eventGroupId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/eventgroup-events/${eventGroupId}/`);
      // Check if response.data.data exists, otherwise return empty array
      return {
        data: response.data.data || [],
        message: response.data.message
      };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch events for this group',
        status: error.response?.status
      });
    }
  }
);


export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventGroupId, eventData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/eventgroup-events/${eventGroupId}/`, eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update event');
    }
  }
);









export const updatePaymentStatus = createAsyncThunk(
  'events/updatePaymentStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/update-payment-status/${id}`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update payment status');
    }
  }
);



export const fetchTotalAmount = createAsyncThunk(
  'eventgroups/fetchTotalAmount',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/get-remaining-amount/${eventId}/`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to fetch total amount'
      );
    }
  }
);



export const addPayment = createAsyncThunk(
  'events/addPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      console.log('Adding payment with data:', paymentData);
      const payload = {
        events: parseInt(paymentData.eventId),
        event_group: parseInt(paymentData.eventGroupId), // Ensure it's a number
        payment_date: paymentData.date,
        paid_amount: paymentData.amount,
        payment_status: paymentData.status
      };
      console.log('Payment API payload:', payload);
      
      const response = await axiosInstance.post('/payment/', payload);
      console.log('Payment API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Payment API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || 'Failed to add payment');
    }
  }
);








export const fetchPaymentDetails = createAsyncThunk(
  'events/fetchPaymentDetails',
  async (eventId, { rejectWithValue }) => {
    try {
      console.log(`Fetching payment details for event ID: ${eventId}`);
      
      const response = await axiosInstance.get(`/payment-details/${eventId}/`);
      
      console.log('Payment Details API Response:', {
        status: response.status,
        data: response.data
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Payment Details Fetch Error:', {
        error: error.response?.data || error.message,
        eventId: eventId
      });
      
      return rejectWithValue(error.response?.data || 'Failed to fetch payment details');
    }
  }
);











export const cancelEvent = createAsyncThunk(
  'events/cancelEvent',
  async ({ eventId, eventGroupId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/eventgroup-events/${eventGroupId}/`, {
        data: { id: eventId.toString() }
      });
      return { eventId, response: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to cancel event');
    }
  }
);

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const eventssuperadminSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all events cases
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.data = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred while fetching events';
      })
      // Fetch events by group ID cases
      .addCase(fetchEventsByGroupId.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchEventsByGroupId.fulfilled, (state, action) => {
        state.loading = false;
        state.data = Array.isArray(action.payload.data) ? action.payload.data : [];
        state.message = action.payload.message;
      })
      .addCase(fetchEventsByGroupId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'An error occurred';
        state.data = [];
      })
      // Update payment status cases
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEvent = action.payload;
        state.data = state.data.map(event =>
          event.id === updatedEvent.id ? updatedEvent : event
        );
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred while updating payment status';
      })
      // Cancel event cases
      .addCase(cancelEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(event => event.id !== action.payload.eventId);
      })
      .addCase(cancelEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred while canceling the event';
      }).addCase(fetchTotalAmount.pending, (state) => {
        state.totalAmountLoading = true;
        state.totalAmountError = null;
      })
      .addCase(fetchTotalAmount.fulfilled, (state, action) => {
        state.totalAmountLoading = false;
        state.totalAmount = action.payload;
        state.totalAmountError = null;
      })
      .addCase(fetchTotalAmount.rejected, (state, action) => {
        state.totalAmountLoading = false;
        state.totalAmountError = action.payload;
      })






      .addCase(addPayment.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.paymentLoading = false;
        // Optionally update the event data if needed
        // You might want to refresh the event data here
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload || 'Failed to add payment';
      })







      .addCase(fetchPaymentDetails.pending, (state) => {
        state.paymentDetailsLoading = true;
        state.paymentDetailsError = null;
      })
      .addCase(fetchPaymentDetails.fulfilled, (state, action) => {
        state.paymentDetailsLoading = false;
        state.paymentDetails = action.payload;
      })
      .addCase(fetchPaymentDetails.rejected, (state, action) => {
        state.paymentDetailsLoading = false;
        state.paymentDetailsError = action.payload;
      })




      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map(event =>
          event.id === action.payload.id ? action.payload : event
        );
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update event';
      });
  },
});

export const { clearError } = eventssuperadminSlice.actions;
export default eventssuperadminSlice.reducer;