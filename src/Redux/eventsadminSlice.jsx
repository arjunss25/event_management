import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch event data
export const fetchEvents = createAsyncThunk('events/fetchEvents', async () => {
  const response = await axios.get('src/utils/eventsDataadmin.json');
  console.log('Fetched data:', response.data); 
  return response.data;
});

const eventsadminSlice = createSlice({
  name: 'events',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    updatePaymentStatus: (state, action) => {
      const { id, status } = action.payload;
      const event = state.data.find(event => event.id === id);
      if (event) {
        event.paymentstatus = status;
      }
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
        // Ensure data is an array or fallback to empty array
        state.data = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { updatePaymentStatus } = eventsadminSlice.actions;
export default eventsadminSlice.reducer;
