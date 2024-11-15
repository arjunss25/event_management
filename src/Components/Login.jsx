import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure } from '../Redux/authSlice';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firebaseToken, setFirebaseToken] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a token in localStorage and dispatch loginSuccess if found
    const savedToken = localStorage.getItem('access_token');
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedToken && savedUser) {
      dispatch(loginSuccess({
        token: savedToken,
        user: savedUser,
      }));
      navigate(`/${savedUser.role.toLowerCase()}/dashboard`);
    }
  }, [dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Firebase Token:', firebaseToken);

    // Ensure either Firebase token or email/password is provided
    if (!firebaseToken && (!email || !password)) {
      setError('Please provide either a Firebase token or email/password for authentication.');
      return;
    }

    try {
      const loginData = firebaseToken ? { firebaseToken } : { email, password };

      const response = await axios.post(
        'https://event.neurocode.in/webapi/superadmin-login/',
        loginData
      );
      console.log('Response Data:', response.data);

      if (response.status === 200 && response.data.status === 'Success') {
        const { access: token, refresh, role } = response.data.data;
      
        // Log the extracted data for verification
        console.log('Access Token:', token);
        console.log('Refresh Token:', refresh);
        console.log('User Role:', role);
      
        // Dispatch loginSuccess with the correct payload
        dispatch(loginSuccess({
          token,
          user: { role },
        }));

        // Store token and user data in localStorage
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify({ role }));

        // Navigate based on user role
        switch (role?.trim().toLowerCase()) {
          case 'superadmin':
            navigate('/superadmin/dashboard');
            break;
          case 'admin':
            navigate('/admin');
            break;
          case 'employee':
            navigate('/employee');
            break;
          default:
            setError(`Unauthorized role: ${role}`);
            break;
        }
      } else {
        setError(response.data.message || 'Authentication failed. Please check your credentials or token.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      dispatch(loginFailure({ error: error.message }));
      setError('Authentication failed. Please check your credentials or token.');
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
          />
        </div>
        <div className="input-group">
          <label htmlFor="firebaseToken">Firebase Token (optional):</label>
          <input
            type="text"
            id="firebaseToken"
            value={firebaseToken}
            onChange={(e) => setFirebaseToken(e.target.value)}
            placeholder="Enter Firebase token if available"
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
