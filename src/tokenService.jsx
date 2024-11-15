import * as jwtDecode from "jwt-decode";

const TOKEN_CONFIG = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  FIREBASE_TOKEN: 'firebaseToken',
};

export const tokenService = {
  setTokens(accessToken, refreshToken) {
    if (typeof window !== "undefined") {
      // Check if localStorage is available
      if (accessToken) {
        localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN, accessToken);
        console.log('Access Token Set:', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem(TOKEN_CONFIG.REFRESH_TOKEN, refreshToken);
        console.log('Refresh Token Set:', refreshToken);
      }
    } else {
      console.error("localStorage is not available in this environment.");
    }
  },

  setAccessToken(accessToken) {
    if (typeof window !== "undefined" && accessToken) {
      localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN, accessToken);
      console.log('Access Token Set:', accessToken);
    }
  },

  setFirebaseToken(token) {
    if (typeof window !== "undefined" && token) {
      localStorage.setItem(TOKEN_CONFIG.FIREBASE_TOKEN, token);
      console.log('Firebase Token Set:', token);
    }
  },

  getFirebaseToken() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_CONFIG.FIREBASE_TOKEN) || null;
      console.log('Firebase Token Retrieved:', token);
      return token;
    }
    console.error("localStorage is not available.");
    return null;
  },

  getAccessToken() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN) || null;
      console.log('Access Token Retrieved:', token);
      return token;
    }
    console.error("localStorage is not available.");
    return null;
  },

  getRefreshToken() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_CONFIG.REFRESH_TOKEN) || null;
      console.log('Refresh Token Retrieved:', token);
      return token;
    }
    console.error("localStorage is not available.");
    return null;
  },

  clearTokens() {
    if (typeof window !== "undefined") {
      console.log('Clearing Tokens...');
      localStorage.removeItem(TOKEN_CONFIG.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN);
      localStorage.removeItem(TOKEN_CONFIG.FIREBASE_TOKEN);
      localStorage.removeItem(TOKEN_CONFIG.USER_DATA);
      console.log('Tokens Cleared');
    } else {
      console.error("localStorage is not available.");
    }
  },

  setUserData(userData) {
    if (typeof window !== "undefined" && userData) {
      localStorage.setItem(TOKEN_CONFIG.USER_DATA, JSON.stringify(userData));
      console.log('User Data Set:', userData);
    }
  },

  getUserData() {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem(TOKEN_CONFIG.USER_DATA);
      try {
        const parsedData = userData ? JSON.parse(userData) : null;
        console.log('User Data Retrieved:', parsedData);
        return parsedData;
      } catch (error) {
        console.error('Failed to parse user data:', error);
        return null;
      }
    }
    console.error("localStorage is not available.");
    return null;
  },

  getUserRole() {
    const userData = this.getUserData();
    const role = userData ? userData.role : null;
    console.log('User Role Retrieved:', role);
    return role;
  },

  isTokenExpired(token) {
    if (!token) {
      console.log('Token is null/undefined, considered expired');
      return true;
    }
    try {
      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp < currentTime;
      console.log('Token Decoded:', decoded);
      console.log('Token Expired:', isExpired);
      return isExpired;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  },
};
