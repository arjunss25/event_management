import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../axiosConfig';

// Create a thunk to fetch users
export const fetchRegisteredUsers = createAsyncThunk(
  'adminUserRegistration/fetchRegisteredUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/list-registered-users/');
      
      if (response.data.status !== "Success") {
        return rejectWithValue(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch registered users'
      );
    }
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
        state.error = null;
      })
      .addCase(fetchRegisteredUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch users';
        state.users = [];
      });
  },
});

export default adminUserRegistrationSlice.reducer;
