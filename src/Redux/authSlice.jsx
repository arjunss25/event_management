import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  isAuthenticated: false,
  user: null,
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
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null; 
    },
    loginFailure(state, action) {
      state.error = action.payload; 
      state.isAuthenticated = false;
      state.loading = false;
      state.token = null;
      state.user = null;
    },
    logout(state) {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.loading = false;
    },
    updateUserData(state, action) {
      state.user = { ...state.user, ...action.payload };
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
