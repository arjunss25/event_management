import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('accessToken') || null, // Retrieve token from localStorage if available
  isAuthenticated: !!localStorage.getItem('accessToken'), // Determine authentication status based on token presence
  user: JSON.parse(localStorage.getItem('userData')) || null, // Retrieve user data from localStorage
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      const { token, user } = action.payload;

      // Store in Redux state
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      // Store in localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
    },
    loginFailure(state, action) {
      state.error = action.payload;
      state.isAuthenticated = false;
      state.loading = false;
      state.token = null;
      state.user = null;

      // Clear any stale data from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
    },
    logout(state) {
      // Clear Redux state
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.loading = false;

      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
    },
    updateUserData(state, action) {
      // Update Redux state
      state.user = { ...state.user, ...action.payload };

      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(state.user));
    },
  },
});

// Action creators
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUserData,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;

// Auth slice reducer
export default authSlice.reducer;
