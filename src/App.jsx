import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './Redux/Store';

// Routes
import AppRoutes from './Routes'; // Import the routes

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppRoutes /> {/* Use the AppRoutes component here */}
      </Router>
    </Provider>
  );
};

export default App;