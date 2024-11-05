import React, { useState, useCallback } from 'react';
import { loginWithEmail, loginWithGoogle, authenticateWithBackend } from '../authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthentication = useCallback(async (firebaseResult) => {
    if (!firebaseResult.success) {
      setMessage(firebaseResult.error);
      return false;
    }

    console.log('Firebase authentication successful:', {
      email: firebaseResult.user.email,
      uid: firebaseResult.user.uid,
      displayName: firebaseResult.user.displayName
    });

    // Authenticate with backend
    const backendResult = await authenticateWithBackend({
      email: firebaseResult.user.email,
      firebaseToken: firebaseResult.firebaseToken,
      firebaseUID: firebaseResult.user.uid,
      displayName: firebaseResult.user.displayName
    });

    // Store authentication data
    localStorage.setItem('authToken', backendResult.token);
    localStorage.setItem('userEmail', firebaseResult.user.email);
    
    // Log the stored token
    console.log('Stored authentication token:', backendResult.token);
    
    setMessage(backendResult.message || 'Login successful!');
    return true;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (!email || !password) {
        setMessage('Please fill in all fields');
        return;
      }

      const firebaseResult = await loginWithEmail(email, password);
      const success = await handleAuthentication(firebaseResult);
      
      if (success) {
        console.log('Login successful - ready for redirect');
        // Handle redirect here
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const firebaseResult = await loginWithGoogle();
      const success = await handleAuthentication(firebaseResult);
      
      if (success) {
        console.log('Google login successful - ready for redirect');
        // Handle redirect here
      }
    } catch (error) {
      console.error('Google login error:', error);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-100"
            >
              Continue with Google
            </button>
          </div>
        </form>

        {message && (
          <div className={`mt-4 text-center ${
            message.includes('successful') || message.includes('Firebase') 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;