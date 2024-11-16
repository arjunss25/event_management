import * as jwtDecode from "jwt-decode";

const TOKEN_CONFIG = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  FIREBASE_TOKEN: 'firebaseToken',
};

export const tokenService = {
  setTokens(accessToken, refreshToken, firebaseToken) {
    console.log('setTokens called with:', { 
      accessToken: accessToken ? '✓' : '✗', 
      refreshToken: refreshToken ? '✓' : '✗', 
      firebaseToken: firebaseToken ? '✓' : '✗' 
    });
    
    if (typeof window !== "undefined") {
      try {
        if (accessToken) {
          localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN, accessToken);
          console.log('✅ Access Token stored successfully');
        }
        
        if (refreshToken) {
          localStorage.setItem(TOKEN_CONFIG.REFRESH_TOKEN, refreshToken);
          console.log('✅ Refresh Token stored successfully');
        }
        
        if (firebaseToken) {
          localStorage.setItem(TOKEN_CONFIG.FIREBASE_TOKEN, firebaseToken);
          console.log('✅ Firebase Token stored successfully');
        } else {
          console.warn('⚠️ No Firebase token provided to setTokens');
        }

        // Verify storage
        console.log('🔍 Verifying stored tokens:', {
          accessToken: localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN) ? '✓' : '✗',
          refreshToken: localStorage.getItem(TOKEN_CONFIG.REFRESH_TOKEN) ? '✓' : '✗',
          firebaseToken: localStorage.getItem(TOKEN_CONFIG.FIREBASE_TOKEN) ? '✓' : '✗'
        });
      } catch (error) {
        console.error('❌ Error storing tokens:', error);
      }
    } else {
      console.error("❌ localStorage is not available in this environment.");
    }
  },

  setAccessToken(accessToken) {
    console.log('setAccessToken called');
    if (typeof window !== "undefined" && accessToken) {
      try {
        localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN, accessToken);
        console.log('✅ Access Token set separately');
      } catch (error) {
        console.error('❌ Error setting access token:', error);
      }
    }
  },

  setFirebaseToken(token) {
    console.log('setFirebaseToken called');
    if (typeof window !== "undefined" && token) {
      try {
        localStorage.setItem(TOKEN_CONFIG.FIREBASE_TOKEN, token);
        console.log('✅ Firebase Token set separately');
        console.log('🔍 Verified Firebase Token in storage:', 
          localStorage.getItem(TOKEN_CONFIG.FIREBASE_TOKEN) ? '✓' : '✗'
        );
      } catch (error) {
        console.error('❌ Error setting Firebase token:', error);
      }
    } else {
      console.warn('⚠️ Cannot set Firebase token: window undefined or token missing');
    }
  },

  getFirebaseToken() {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem(TOKEN_CONFIG.FIREBASE_TOKEN);
        console.log('🔍 Getting Firebase Token:', token ? '✓' : '✗');
        return token;
      } catch (error) {
        console.error('❌ Error getting Firebase token:', error);
        return null;
      }
    }
    console.error("❌ localStorage is not available.");
    return null;
  },

  getAccessToken() {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN);
        console.log('🔍 Getting Access Token:', token ? '✓' : '✗');
        return token;
      } catch (error) {
        console.error('❌ Error getting access token:', error);
        return null;
      }
    }
    console.error("❌ localStorage is not available.");
    return null;
  },

  getRefreshToken() {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem(TOKEN_CONFIG.REFRESH_TOKEN);
        console.log('🔍 Getting Refresh Token:', token ? '✓' : '✗');
        return token;
      } catch (error) {
        console.error('❌ Error getting refresh token:', error);
        return null;
      }
    }
    console.error("❌ localStorage is not available.");
    return null;
  },

  clearTokens() {
    if (typeof window !== "undefined") {
      try {
        console.log('🗑️ Clearing all tokens...');
        localStorage.removeItem(TOKEN_CONFIG.ACCESS_TOKEN);
        localStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN);
        localStorage.removeItem(TOKEN_CONFIG.FIREBASE_TOKEN);
        localStorage.removeItem(TOKEN_CONFIG.USER_DATA);
        console.log('✅ All tokens cleared successfully');
      } catch (error) {
        console.error('❌ Error clearing tokens:', error);
      }
    } else {
      console.error("❌ localStorage is not available.");
    }
  },

  setUserData(userData) {
    if (typeof window !== "undefined" && userData) {
      try {
        localStorage.setItem(TOKEN_CONFIG.USER_DATA, JSON.stringify(userData));
        console.log('✅ User Data stored successfully');
      } catch (error) {
        console.error('❌ Error storing user data:', error);
      }
    }
  },

  getUserData() {
    if (typeof window !== "undefined") {
      try {
        const userData = localStorage.getItem(TOKEN_CONFIG.USER_DATA);
        const parsedData = userData ? JSON.parse(userData) : null;
        console.log('🔍 Getting User Data:', parsedData ? '✓' : '✗');
        return parsedData;
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        return null;
      }
    }
    console.error("❌ localStorage is not available.");
    return null;
  },

  getUserRole() {
    try {
      const userData = this.getUserData();
      const role = userData ? userData.role : null;
      console.log('👤 User Role Retrieved:', role);
      return role;
    } catch (error) {
      console.error('❌ Error getting user role:', error);
      return null;
    }
  },

  isTokenExpired(token) {
    if (!token) {
      console.log('⚠️ Token is null/undefined, considered expired');
      return true;
    }
    try {
      console.log('🔍 Checking token expiration');
      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp < currentTime;
      console.log('Token Expiration Status:', isExpired ? '❌ Expired' : '✅ Valid');
      return isExpired;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return true;
    }
  },
};