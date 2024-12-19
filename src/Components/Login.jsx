import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure } from '../Redux/authSlice';
import { tokenService } from '../tokenService';
import { auth } from '../firebase/firebaseConfig';
import { signInWithCustomToken } from 'firebase/auth';
import axios from 'axios';
import { PiHandWaving, PiEyeLight, PiEyeSlashLight } from 'react-icons/pi';
import { FcGoogle } from 'react-icons/fc';
import { loginWithGoogle, authenticateWithBackend } from '../authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = tokenService.getAccessToken();
    const firebaseToken = tokenService.getFirebaseToken();
    const userData = tokenService.getUserData();

    if (accessToken && userData) {
      if (firebaseToken) {
        signInWithCustomToken(auth, firebaseToken).catch((error) => {
          tokenService.clearTokens();
        });
      }

      dispatch(
        loginSuccess({
          token: accessToken,
          user: userData,
        })
      );

      if (userData.role.toLowerCase() === 'admin') {
        navigate('/admin/welcomepage');
      } else {
        navigate(`/${userData.role.toLowerCase()}/dashboard`);
      }
    }
  }, [dispatch, navigate]);

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post(
        'https://event.neurocode.in/webapi/unified-login/',
        { email, password }
      );

      const { access, refresh, role, firebaseToken, event_group_id } =
        response.data.data;

      if (firebaseToken) {
        try {
          await signInWithCustomToken(auth, firebaseToken);
        } catch (firebaseError) {
          throw new Error('Firebase authentication failed');
        }
      } else {
      }

      tokenService.setTokens(access, refresh, firebaseToken);

      const userData = {
        email,
        role,
      };
      tokenService.setUserData(userData);

      dispatch(
        loginSuccess({
          token: access,
          user: userData,
          event_group_id: event_group_id,
        })
      );

      switch (role?.toLowerCase()) {
        case 'superadmin':
          navigate('/superadmin/dashboard');
          break;
        case 'admin':
          navigate('/admin/welcomepage');
          break;
        case 'employee':
          navigate('/employee/scanner');
          break;
        default:
          setError(`Unauthorized role: ${role}`);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Authentication failed. Please check your credentials.';
      dispatch(loginFailure(errorMessage));
      setError(errorMessage);
      tokenService.clearTokens();
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');

      if (!auth) {
        throw new Error('Firebase authentication not initialized');
      }

      const result = await loginWithGoogle();

      if (result.success && result.firebaseToken) {
        try {
          // Verify Firebase auth state
          const currentUser = auth.currentUser;
          if (!currentUser) {
            throw new Error('Firebase user not found after sign-in');
          }

          const backendResponse = await authenticateWithBackend({
            firebase_token: result.firebaseToken,
            email: result.user.email,
          });

          const { access, refresh, role } = backendResponse;

          // Store tokens and user data
          tokenService.setTokens(access, refresh, result.firebaseToken);
          const userData = {
            email: result.user.email,
            role,
            uid: result.user.uid,
          };
          tokenService.setUserData(userData);

          dispatch(
            loginSuccess({
              token: access,
              user: userData,
            })
          );

          // Navigate based on role
          switch (role?.toLowerCase()) {
            case 'superadmin':
              navigate('/superadmin/dashboard');
              break;
            case 'admin':
              navigate('/admin/welcomepage');
              break;
            case 'employee':
              navigate('/employee/scanner');
              break;
            default:
              throw new Error(`Unauthorized role: ${role}`);
          }
        } catch (backendError) {
          await auth.signOut();
          tokenService.clearTokens();

          throw new Error(
            backendError.response?.data?.message ||
              'Failed to authenticate with the server. Please try again.'
          );
        }
      } else {
        throw new Error(result.error || 'Google sign-in failed');
      }
    } catch (error) {
      setError(error.message);
      tokenService.clearTokens();
    }
  };

  return (
    <div className="w-full h-auto lg:h-screen flex items-center justify-center p-10 lg:p-0">
      <div className="w-[90%] lg:w-[70vw] h-auto lg:h-[80vh] flex flex-col lg:flex-row items-center justify-center gap-7 lg:gap-[10%] rounded-lg  py-5 lg:p-0">
        {/* Left image section */}
        <div className="left w-[90%] lg:w-[40%] h-auto lg:h-[90%] bg-[#EBF5FF] rounded-lg flex flex-col items-center justify-between object-contain">
          <img
            className="object-contain h-[90%]"
            src="src/assets/login-img.png"
            alt="img"
          />
          <p className="text-center font-regular text-[0.8rem] pb-5">
            © 2024 All Rights Reserved.
          </p>
        </div>

        {/* Right form section */}
        <div className="right flex flex-col gap-5 w-[90%] lg:w-[45%] h-[90%] justify-center">
          {/* Heading */}
          <div className="heading flex flex-col items-center lg:items-start gap-2">
            <div className="text-[1.5rem] lg:text-[2rem] flex items-center justify-center lg:justify-start gap-3">
              <h1 className="font-semibold">WELCOME BACK</h1>
              <h1 className="text-yellow-400">
                <PiHandWaving />
              </h1>
            </div>
            <p className="font-regular text-[0.6rem] lg:text-[0.7rem]">
              Enter your email and password to access your account
            </p>
          </div>

          {/* Error messages container */}
          {(validationErrors.email || validationErrors.password) && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex flex-col">
                {validationErrors.email && (
                  <p className="text-red-700 text-sm">{validationErrors.email}</p>
                )}
                {validationErrors.password && (
                  <p className="text-red-700 text-sm">{validationErrors.password}</p>
                )}
              </div>
            </div>
          )}

          {/* General error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form
            className="w-full flex flex-col items-start justify-center gap-3"
            onSubmit={handleSubmit}
          >
            <label>Email</label>
            <input
              type="text"
              className={`form-field w-full lg:w-[70%] h-9 bg-[#EBF5FF] rounded text-[0.8rem] pl-3 ${
                validationErrors.email ? 'border-2 border-red-500' : ''
              }`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <div className="relative w-full lg:w-[70%]">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-field w-full h-9 bg-[#EBF5FF] rounded text-[0.8rem] pl-3 pr-10 ${
                  validationErrors.password ? 'border-2 border-red-500' : ''
                }`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-4 top-[32%] -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <PiEyeLight size={18} />
                ) : (
                  <PiEyeSlashLight size={18} />
                )}
              </button>
            </div>

            <button
              type="submit"
              className="form-field w-full lg:w-[70%] h-10 bg-sky-600 text-white rounded"
            >
              Sign In
            </button>

            {/* <div className="form-field w-full lg:w-[70%] text-center">
              <p className="text-[0.8rem]">
                Don't have an Account?{' '}
                <span className="font-bold">Sign up</span>
              </p>
            </div> */}

            <div className="form-field flex items-center justify-center w-full lg:w-[73%] gap-[10%] border-black">
              <hr className="w-[45%]" />
              <p>Or</p>
              <hr className="w-[45%]" />
            </div>

            <button
              type="button"
              className="form-field w-full lg:w-[70%] h-10 border text-black rounded flex items-center justify-center gap-2 bg-[#EBF5FF]"
              onClick={handleGoogleSignIn}
            >
              <FcGoogle />
              Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
