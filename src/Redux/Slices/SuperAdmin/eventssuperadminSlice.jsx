import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchEvents = createAsyncThunk('events/fetchEvents', async () => {
  try {
    const response = await axios.get('src/utils/eventsDatasuperadmin.json');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
});

const eventssuperadminSlice = createSlice({
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
        state.data = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { updatePaymentStatus } = eventssuperadminSlice.actions;
export default eventssuperadminSlice.reducer;