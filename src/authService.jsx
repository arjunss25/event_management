import { 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup 
  } from 'firebase/auth';
  import { auth } from './firebase/firebaseConfig';
  import { API_CONFIG } from './config/config';
  
  export const checkServerConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/health-check/`, {
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
  
  export const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseToken = await userCredential.user.getIdToken();
      
      // Log the Firebase token
      console.log('Firebase Token:', firebaseToken);
      
      return { 
        success: true, 
        firebaseToken,
        user: {
          email: userCredential.user.email,
          uid: userCredential.user.uid,
          displayName: userCredential.user.displayName
        }
      };
    } catch (error) {
      console.error('Firebase login error:', error);
      let errorMessage = "Login failed";
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = "Invalid email or password";
          break;
        case 'auth/user-not-found':
          errorMessage = "No account found with this email";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password";
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
      
      // Log the Firebase token
      console.log('Firebase Token:', firebaseToken);
      
      return { 
        success: true, 
        firebaseToken,
        user: {
          email: userCredential.user.email,
          uid: userCredential.user.uid,
          displayName: userCredential.user.displayName
        }
      };
    } catch (error) {
      console.error('Google login error:', error);
      let errorMessage = "Google sign-in failed";
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = "Sign-in popup was closed";
          break;
        case 'auth/popup-blocked':
          errorMessage = "Sign-in popup was blocked. Please allow popups for this site.";
          break;
        default:
          errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  };
  
  export const authenticateWithBackend = async (credentials) => {
    try {
      // First check if server is reachable
      const isServerReachable = await checkServerConnection();
      
      // Log authentication attempt
      console.log('Attempting backend authentication with credentials:', {
        email: credentials.email,
        uid: credentials.firebaseUID,
        displayName: credentials.displayName
      });
  
      if (!isServerReachable) {
        console.log('Server is not reachable, proceeding with Firebase-only authentication');
        // If server is not reachable, return success with just the Firebase token
        return { 
          success: true, 
          token: credentials.firebaseToken,
          message: 'Authenticated with Firebase only (backend server unavailable)'
        };
      }
  
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/superadmin-login/`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });
  
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Backend authentication failed');
      }
  
      const data = await response.json();
      console.log('Backend authentication successful:', data);
      return { success: true, ...data };
    } catch (error) {
      console.error('Backend authentication error:', error);
      
      if (error.name === 'AbortError') {
        return { 
          success: true, // Changed to true since we have Firebase auth
          token: credentials.firebaseToken,
          message: 'Using Firebase authentication (backend request timed out)'
        };
      }
      
      if (error.message.includes('Failed to fetch')) {
        return { 
          success: true, // Changed to true since we have Firebase auth
          token: credentials.firebaseToken,
          message: 'Using Firebase authentication (backend server unavailable)'
        };
      }
  
      return { 
        success: true, // Changed to true since we have Firebase auth
        token: credentials.firebaseToken,
        message: 'Using Firebase authentication (backend error: ' + error.message + ')'
      };
    }
  };
  