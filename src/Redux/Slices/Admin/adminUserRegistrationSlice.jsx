import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registeredUsersData } from '../../../data/mockUsers';

export const fetchRegisteredUsers = createAsyncThunk(
  'adminUserRegistration/fetchRegisteredUsers',
  async () => {
    // Simulating API call with a promise
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(registeredUsersData);
      }, 500);
    });
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