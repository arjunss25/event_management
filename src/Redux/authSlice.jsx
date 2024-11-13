import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  token: null,
  isAuthenticated: false,
  error: null,
};

// Create a slice of the Redux store
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.token = null;
      state.isAuthenticated = false;
    },
    loginFailure(state, action) {
      state.error = action.payload.error;
    },
  },
});

// Export actions
export const { loginSuccess, logout, loginFailure } = authSlice.actions;

// Selectors to access auth state
export const selectAuthToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.error;

// Export the reducer
export default authSlice.reducer;
