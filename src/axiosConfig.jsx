import axios from 'axios';
import { refreshAccessToken } from './authService';
import { tokenService } from './tokenService';

const axiosInstance = axios.create({
  baseURL: 'https://event.neurocode.in/webapi',
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const firebaseToken = tokenService.getFirebaseToken();
    let accessToken = tokenService.getAccessToken();

    // Check if access token exists and is expired
    if (accessToken && tokenService.isTokenExpired(accessToken)) {
      try {
        // Refresh the access token if expired
        accessToken = await refreshAccessToken();
      } catch (error) {
        // If refresh fails, clear tokens and redirect to login
        tokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Set both Firebase and JWT tokens in headers
    config.headers.Authorization = `Bearer ${accessToken}`;
    if (firebaseToken) {
      config.headers['Firebase-Token'] = `Bearer ${firebaseToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized error and check if request has been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the access token
        const newAccessToken = await refreshAccessToken();
        
        // Update the Authorization header with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Keep the Firebase token in the headers
        const firebaseToken = tokenService.getFirebaseToken();
        if (firebaseToken) {
          originalRequest.headers['Firebase-Token'] = `Bearer ${firebaseToken}`;
        }

        // Retry the original request with the new tokens
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If token refresh fails, clear tokens and redirect to login
        tokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;