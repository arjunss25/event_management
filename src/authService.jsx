import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import { API_CONFIG } from './config/config';
import { tokenService } from './tokenService';

export const checkServerConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    const response = await fetch('https://event.neurocode.in/webapi/health-check/', {
      method: 'GET',
      signal: controller.signal,
    });
    
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
    const firebaseToken = tokenService.getFirebaseToken();

    if (!refreshToken || !firebaseToken) {
      throw new Error('Missing tokens for refresh');
    }

    const response = await fetch('https://event.neurocode.in/webapi/refresh-token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`, // Firebase token
      },
      body: JSON.stringify({ refresh: refreshToken }),
    }); 
    

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to refresh token');
    }

    const data = await response.json();
    tokenService.setTokens(data.access, data.refresh); // Update tokens
    return data.access;
  } catch (error) {
    console.error('Token refresh failed:', error.message);
    tokenService.clearTokens();
    throw error;
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseToken = await userCredential.user.getIdToken();
    tokenService.setFirebaseToken(firebaseToken); // Store Firebase token

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
    tokenService.setFirebaseToken(firebaseToken); // Store Firebase token

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
    const response = await fetch('https://event.neurocode.in/webapi/superadmin-login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${credentials.firebaseToken}`, // Firebase token
      },
      body: JSON.stringify({
        email: credentials.email,
        token: credentials.firebaseToken,
        uid: credentials.uid,
        displayName: credentials.displayName || '',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Backend authentication failed');
    }

    const data = await response.json();

    tokenService.setTokens(data.access, data.refresh);
    tokenService.setUserData({
      email: credentials.email,
      uid: credentials.uid,
      displayName: credentials.displayName,
      role: data.role, // Store role
    });

    return { success: true, ...data };
  } catch (error) {
    console.error('Backend authentication error:', error.message);
    throw error;
  }
};

export const getUserData = () => tokenService.getUserData();

export const logout = () => {
  tokenService.clearTokens();
  window.location.href = '/login';
};
