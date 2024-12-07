import * as jwtDecode from "jwt-decode";

const TOKEN_CONFIG = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  FIREBASE_TOKEN: 'firebaseToken',
};

export const tokenService = {
  setTokens(accessToken, refreshToken, firebaseToken = null) {
    if (typeof window !== "undefined") {
      try {
        if (accessToken) {
          localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN, accessToken);
        }
        
        if (refreshToken) {
          localStorage.setItem(TOKEN_CONFIG.REFRESH_TOKEN, refreshToken);
        }
        
        if (firebaseToken) {
          localStorage.setItem(TOKEN_CONFIG.FIREBASE_TOKEN, firebaseToken);
        }

        // Verify tokens were stored
        const storedAccess = localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN);
        const storedRefresh = localStorage.getItem(TOKEN_CONFIG.REFRESH_TOKEN);

        if (accessToken && !storedAccess || refreshToken && !storedRefresh) {
          throw new Error('Token storage verification failed');
        }
      } catch (error) {
        this.clearTokens();
        throw error;
      }
    }
  },

  setAccessToken(accessToken) {
    if (typeof window !== "undefined" && accessToken) {
      try {
        localStorage.setItem(TOKEN_CONFIG.ACCESS_TOKEN, accessToken);
      } catch (error) {
      }
    }
  },

  setFirebaseToken(token) {
    if (typeof window !== "undefined" && token) {
      try {
        localStorage.setItem(TOKEN_CONFIG.FIREBASE_TOKEN, token);
      } catch (error) {
      }
    } else {
    }
  },

  getFirebaseToken() {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem(TOKEN_CONFIG.FIREBASE_TOKEN);
        return token;
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  getAccessToken() {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem(TOKEN_CONFIG.ACCESS_TOKEN);
        return token;
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  getRefreshToken() {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem(TOKEN_CONFIG.REFRESH_TOKEN);
        return token;
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  clearTokens() {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(TOKEN_CONFIG.ACCESS_TOKEN);
        localStorage.removeItem(TOKEN_CONFIG.REFRESH_TOKEN);
        localStorage.removeItem(TOKEN_CONFIG.FIREBASE_TOKEN);
        localStorage.removeItem(TOKEN_CONFIG.USER_DATA);
      } catch (error) {
      }
    } else {
    }
  },

  setUserData(userData) {
    if (typeof window !== "undefined" && userData) {
      try {
        localStorage.setItem(TOKEN_CONFIG.USER_DATA, JSON.stringify(userData));
      } catch (error) {
      }
    }
  },

  getUserData() {
    if (typeof window !== "undefined") {
      try {
        const userData = localStorage.getItem(TOKEN_CONFIG.USER_DATA);
        const parsedData = userData ? JSON.parse(userData) : null;
        return parsedData;
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  getUserRole() {
    try {
      const userData = this.getUserData();
      const role = userData ? userData.role : null;
      return role;
    } catch (error) {
      return null;
    }
  },

  isTokenExpired(token) {
    if (!token) {
      return true;
    }
    try {
      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp < currentTime;
      return isExpired;
    } catch (error) {
      return true;
    }
  },

  isAccessTokenExpired() {
    const token = this.getAccessToken();
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  },
};