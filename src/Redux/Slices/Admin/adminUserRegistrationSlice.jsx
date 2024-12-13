import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../axiosConfig';

// Create a thunk to fetch users
export const fetchRegisteredUsers = createAsyncThunk(
  'adminUserRegistration/fetchRegisteredUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/list-registered-users/');

      // Check if response.data exists and contains the data array
      if (response.data && response.data.data) {
        return response.data.data;
      }

      return rejectWithValue('No user data available');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch registered users'
      );
    }
  }
);

// Create a thunk for searching users
export const searchUsers = createAsyncThunk(
  'adminUserRegistration/searchUsers',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/search-users/${searchTerm}/`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return rejectWithValue('No user data available');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to search users'
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
    searchTerm: '',
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
  },
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
      })
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to search users';
        state.users = [];
      });
  },
});

export default adminUserRegistrationSlice.reducer;
