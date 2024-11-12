import React, { useState, useCallback } from 'react';
import { loginWithEmail, loginWithGoogle } from '../authService';
import { FcGoogle } from "react-icons/fc";
import { MdWavingHand } from "react-icons/md";

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

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

    try {
      const backendResult = await fetch('http://127.0.0.1:8000/api/superadmin-login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: firebaseResult.user.email,
          firebaseToken: firebaseResult.firebaseToken,
          firebaseUID: firebaseResult.user.uid,
          displayName: firebaseResult.user.displayName
        }),
      }).then(res => res.json());

      if (backendResult.token) {
        localStorage.setItem('authToken', backendResult.token);
        localStorage.setItem('userEmail', firebaseResult.user.email);
        setMessage('Login successful!');
        return true;
      } else {
        setMessage(backendResult.error || 'Failed to authenticate with backend');
        return false;
      }
    } catch (error) {
      setMessage('Failed to connect to backend server');
      return false;
    }
  }, []);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (!/\S+@\S+\.\S+/.test(value)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (!value) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
    } else {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validate form
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
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

  const handleGoogleSignIn = async () => {
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
    <div className='w-full h-auto lg:h-screen flex items-center justify-center'>
      <div className="w-[90%] lg:w-[70vw] h-auto lg:h-[80vh] flex flex-col lg:flex-row items-center justify-center gap-7 lg:gap-[10%] rounded-lg shadow-[0_0_5px_rgba(0,0,0,0.2)] py-5 lg:p-0">
        {/* Left image section */}
        <div className="left w-[90%] lg:w-[40%] h-auto lg:h-[90%] bg-[#EBF5FF] rounded-lg flex flex-col items-center justify-between object-contain">
          <img className='object-contain h-[90%]' src="login_pic.svg" alt="a man looking at a laptop" />
          <p className='text-center font-regular text-[0.8rem] pb-5'>© 2024 All Rights Reserved.</p>
        </div>

        {/* Right form section */}
        <div className="right flex flex-col gap-5 w-[90%] lg:w-[45%] h-[90%]">
          {/* Heading */}
          <div className="heading flex flex-col items-center lg:items-start gap-2">
            <div className="text-[1.5rem] lg:text-[2rem] flex items-center justify-center lg:justify-start gap-3">
              <h1 className='font-semibold'>WELCOME BACK</h1>
              {/* <img className='w-9' src="waving.svg" alt="hand waving" /> */}
              <MdWavingHand className='text-yellow-400'/>
            </div>
            <p className='font-regular text-[0.6rem] lg:text-[0.7rem]'>Enter your email and password to access your account</p>
          </div>

          {/* Form */}
          <form className='w-full flex flex-col items-start justify-center gap-3' onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="text"
              className='form-field w-full lg:w-[70%] h-9 bg-[#EBF5FF] rounded text-[0.8rem] pl-3'
              placeholder='Enter your email'
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
            />
            {errors.email && <p className='text-red-500 text-sm'>{errors.email}</p>}
            
            <label>Password</label>
            <input
              type="password"
              className='form-field w-full lg:w-[70%] h-9 bg-[#EBF5FF] rounded text-[0.8rem] pl-3'
              placeholder='Enter your password'
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
            />
            {errors.password && <p className='text-red-500 text-sm'>{errors.password}</p>}

            <div className="form-field w-full lg:w-[70%] text-right">
              <p className='text-[0.8rem]'>Forgot Password?</p>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className='form-field w-full lg:w-[70%] h-10 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:bg-sky-400'
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="form-field w-full lg:w-[70%] text-center">
              <p className='text-[0.8rem]'>Don't have an Account? <span className='font-bold'>Sign up</span></p>
            </div>

            <div className="form-field flex items-center justify-center w-full lg:w-[73%] gap-[10%] border-black">
              <hr className='w-[45%]' />
              <p>Or</p>
              <hr className='w-[45%]' />
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className='form-field w-full lg:w-[70%] h-10 border text-black rounded flex items-center justify-center gap-2 bg-[#EBF5FF] hover:bg-[#dcedff] disabled:bg-gray-200'
            >
              <FcGoogle />
              Google
            </button>
          </form>

          {message && (
            <div className={`w-full lg:w-[70%] text-center text-sm ${
              message.includes('successful') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;