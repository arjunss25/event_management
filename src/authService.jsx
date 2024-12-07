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
  provider.addScope('email');
  
  try {
    
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    

    const firebaseToken = await user.getIdToken(true);

    if (!firebaseToken) {
      throw new Error('Failed to generate Firebase token');
    }

    const decodedToken = await auth.currentUser?.getIdTokenResult();

    tokenService.setFirebaseToken(firebaseToken);

    return {
      success: true,
      firebaseToken,
      user: {
        email: user.email,
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    };
  } catch (error) {
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for Google sign-in.');
    }
    
    throw error;
  }
};

export const authenticateWithBackend = async (credentials) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No Firebase user found. Please sign in again.');
    }

    await auth.currentUser.reload();
    const freshToken = await currentUser.getIdToken(true);
    
    if (!freshToken) {
      throw new Error('Failed to generate Firebase token');
    }


    const response = await axiosInstance.post(
      '/unified-login/',
      {
        firebase_token: freshToken,
        email: currentUser.email,
        provider: 'google',
        uid: currentUser.uid
      }
    );

    if (response.data?.status === 'Success') {
      const { access, refresh, role } = response.data.data;
      
      
      return { access, refresh, role };
    }

    throw new Error(response.data?.message || 'Invalid response from server');
  } catch (error) {
    throw error;
  }
};

export const getUserData = () => tokenService.getUserData();

export const logout = () => {
  tokenService.clearTokens();
  window.location.href = '/login';
};
