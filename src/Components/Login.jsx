import React, { useState } from 'react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log the Firebase token for debugging purposes
    console.log('Firebase Token:', firebaseToken);

    // Validate if either firebaseToken or email/password is provided
    if (!firebaseToken && (!email || !password)) {
      setError('Please provide either a Firebase token or email/password for authentication.');
      return;
    }

    try {
      // Making API request with either Firebase token or email/password
      const loginData = firebaseToken
        ? { firebaseToken }
        : { email, password };

      const response = await axios.post(
        'https://event.neurocode.in/webapi/superadmin-login/', 
        loginData
      );

      if (response.status === 200) {
        // Dispatch loginSuccess action with token
        dispatch(loginSuccess({ token: response.data.token }));
        navigate('/');  // Navigate to the admin dashboard (or change this as per your routes)
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
