import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure } from '../Redux/authSlice';
import { tokenService } from '../tokenService';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = tokenService.getAccessToken();
    const userData = tokenService.getUserData();
    if (accessToken && userData) {
      dispatch(loginSuccess({
        token: accessToken,
        user: userData,
      }));
      navigate(`/${userData.role.toLowerCase()}/dashboard`);
    }
  }, [dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // First, authenticate with credentials
      const response = await axios.post(
        'https://event.neurocode.in/webapi/superadmin-login/',
        { email, password }
      );

      if (response.status === 200 && response.data.status === 'Success') {
        const { access, refresh, role, firebaseToken } = response.data.data;
        
        // Store all tokens using tokenService
        tokenService.setTokens(access, refresh);
        tokenService.setFirebaseToken(firebaseToken);
        
        // Store user data
        const userData = {
          email,
          role,
          // Add any other user data from response
        };
        tokenService.setUserData(userData);

        // Update Redux state
        dispatch(loginSuccess({
          token: access,
          user: userData,
        }));

        // Navigate based on role
        switch (role?.toLowerCase()) {
          case 'superadmin':
            navigate('/superadmin/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'employee':
            navigate('/employee/scanner');
            break;
          default:
            setError(`Unauthorized role: ${role}`);
        }
      } else {
        throw new Error(response.data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      dispatch(loginFailure(error.message));
      setError('Authentication failed. Please check your credentials.');
      tokenService.clearTokens();
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;