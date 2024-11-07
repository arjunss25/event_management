import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create a thunk to fetch users
export const fetchRegisteredUsers = createAsyncThunk(
  'adminUserRegistration/fetchRegisteredUsers',
  async () => {
    // Fetch data from local JSON file or API
    const response = await axios.get('src/utils/registeredUsers.json');
    return response.data;
  }
);

const adminUserRegistrationSlice = createSlice({
  name: 'adminUserRegistration',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegisteredUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegisteredUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchRegisteredUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default adminUserRegistrationSlice.reducer;
