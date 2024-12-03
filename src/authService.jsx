import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import { API_CONFIG } from './config/config';
import { tokenService } from './tokenService';
import axiosInstance from './axiosConfig';
import axios from 'axios';

export const checkServerConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    const response = await fetch(
      'https://event.neurocode.in/webapi/health-check/',
      {
        method: 'GET',
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Server connection check failed:', error);
    return false;
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = tokenService.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      'https://event.neurocode.in/webapi/refresh-token/',
      { refresh: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status === 'Success') {
      const { access, refresh } = response.data.data;
      tokenService.setTokens(access, refresh);
      return access;
    } else {
      throw new Error('Token refresh failed');
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    tokenService.clearTokens();
    throw error;
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseToken = await userCredential.user.getIdToken();
    tokenService.setFirebaseToken(firebaseToken);

    return {
      success: true,
      firebaseToken,
      user: {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        displayName: userCredential.user.displayName,
      },
    };
  } catch (error) {
    console.error('Firebase login error:', error);
    let errorMessage = 'Login failed';
    switch (error.code) {
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      default:
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseToken = await userCredential.user.getIdToken();
    
    console.log('Firebase Token generated:', firebaseToken ? 'Token generated successfully' : 'Token generation failed');
    
    tokenService.setFirebaseToken(firebaseToken);

    return {
      success: true,
      firebaseToken,
      user: {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        displayName: userCredential.user.displayName,
      },
    };
  } catch (error) {
    console.error('Google login error:', error);
    let errorMessage = 'Google sign-in failed';
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in popup was closed';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Sign-in popup was blocked. Please allow popups for this site.';
        break;
      default:
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
};

export const authenticateWithBackend = async (credentials) => {
  try {
    console.log('Firebase Token:', credentials.firebase_token);
    
    console.log('Calling API endpoint:', `${axiosInstance.defaults.baseURL}/unified-login/`);
    
    console.log('Request payload:', {
      firebase_token: credentials.firebase_token
    });

    const response = await axiosInstance.post(
      '/unified-login',
      {
        firebase_token: credentials.firebase_token,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.status === "Success") {
      const { access, refresh, role } = response.data.data;

      tokenService.setTokens(access, refresh);
      tokenService.setUserData({
        role: role,
      });

      return {
        success: true,
        ...response.data.data,
      };
    } else {
      throw new Error(response.data?.message || 'Backend authentication failed');
    }
  } catch (error) {
    console.error('Backend authentication error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      firebaseToken: credentials.firebase_token ? 'Present' : 'Missing',
    });

    if (error.response?.status === 404) {
      console.error('Full URL attempted:', `${axiosInstance.defaults.baseURL}${error.config?.url}`);
      throw new Error('Authentication endpoint not found. Please check the API URL configuration.');
    }

    throw error;
  }
};

export const getUserData = () => tokenService.getUserData();

export const logout = () => {
  tokenService.clearTokens();
  window.location.href = '/login';
};
