import * as jwtDecode from "jwt-decode";

const TOKEN_CONFIG = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  FIREBASE_TOKEN: 'firebaseToken' // Added to store Firebase token
};

export const tokenService = {
  setTokens(accessToken, refreshToken) {
    localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_CONFIG.REFRESH_TOKEN, refreshToken);
  },

  setFirebaseToken(token) {
    localStorage.setItem(TOKEN_CONFIG.FIREBASE_TOKEN, token);
  },

  getFirebaseToken() {
    return localStorage.getItem(TOKEN_CONFIG.FIREBASE_TOKEN);
  },

  getAccessToken() {
    return localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN);
  },

  getRefreshToken() {
    return localStorage.getItem(TOKEN_CONFIG.REFRESH_TOKEN);
  },

  clearTokens() {
    localStorage.removeItem(TOKEN_CONFIG.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_CONFIG.USER_DATA);
    localStorage.removeItem(TOKEN_CONFIG.FIREBASE_TOKEN);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('uid');
  },

  isTokenExpired(token) {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  setUserData(data) {
    localStorage.setItem(TOKEN_CONFIG.USER_DATA, JSON.stringify(data));
  },

  getUserData() {
    const data = localStorage.getItem(TOKEN_CONFIG.USER_DATA);
    return data ? JSON.parse(data) : null;
  }
};