import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  user: JSON.parse(localStorage.getItem('userData')) || null,
  error: null,
  loading: false,
  event_group_id: localStorage.getItem('event_group_id') || null,
  event_id: localStorage.getItem('event_id') || null,
  event_name: localStorage.getItem('event_name') || null,
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
      const { token, user, event_group_id, event_id, event_name } = action.payload;

      // Store in Redux state
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.event_group_id = event_group_id;
      state.event_id = event_id;
      state.event_name = event_name;

      // Store in localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('event_group_id', event_group_id);
      localStorage.setItem('event_id', event_id);
      localStorage.setItem('event_name', event_name);
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
      state.event_group_id = null;
      state.event_id = null;
      state.event_name = null;

      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('event_group_id');
      localStorage.removeItem('event_id');
      localStorage.removeItem('event_name');
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
export const selectEventGroupId = (state) => state.auth.event_group_id;
export const selectEventId = (state) => state.auth.event_id;
export const selectEventName = (state) => state.auth.event_name;

// Auth slice reducer
export default authSlice.reducer;
