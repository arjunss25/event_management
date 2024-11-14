import axios from 'axios';
import { refreshAccessToken } from './authService';
import { tokenService } from './tokenService';

const axiosInstance = axios.create({
  baseURL: 'https://event.neurocode.in/webapi',
  timeout: 10000,
});

// Request interceptor to add tokens to request headers
axiosInstance.interceptors.request.use(
  async (config) => {
    const firebaseToken = tokenService.getFirebaseToken();
    let accessToken = tokenService.getAccessToken();
    const userRole = tokenService.getUserRole();  // Assuming role is saved in tokenService

    if (accessToken && tokenService.isTokenExpired(accessToken)) {
      try {
        accessToken = await refreshAccessToken();
        tokenService.setAccessToken(accessToken); // Save the new access token
      } catch (error) {
        tokenService.clearTokens();
        window.location.href = '/login'; // Redirect to login if refreshing token fails
        return Promise.reject(error);
      }
    }

    // Add Authorization headers for access token
    config.headers.Authorization = `Bearer ${accessToken}`;

    // Add Firebase token if available
    if (firebaseToken) {
      config.headers['Firebase-Token'] = `Bearer ${firebaseToken}`;
    }

    // Optionally, add the user role to headers for role-based access control
    if (userRole) {
      config.headers['User-Role'] = userRole; // You can add role-specific checks on the backend
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry and retry
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired (401), try to refresh the token and retry the original request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        tokenService.setAccessToken(newAccessToken); // Update token in storage
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the original request with the new token
        const firebaseToken = tokenService.getFirebaseToken();
        if (firebaseToken) {
          originalRequest.headers['Firebase-Token'] = `Bearer ${firebaseToken}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        tokenService.clearTokens();
        window.location.href = '/login'; // Redirect to login if refresh token fails
        return Promise.reject(refreshError);
      }
    }

    // If the error is not token-related, reject it
    return Promise.reject(error);
  }
);

export default axiosInstance;
