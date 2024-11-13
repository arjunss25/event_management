// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { tokenService } from './tokenService';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const initializeAuth = () => {
//       const accessToken = tokenService.getAccessToken();
//       const userData = tokenService.getUserData();

//       if (accessToken && !tokenService.isTokenExpired(accessToken) && userData) {
//         setIsAuthenticated(true);
//         setUser(userData);
//       } else {
//         tokenService.clearTokens();
//         setIsAuthenticated(false);
//         setUser(null);
//       }
//       setLoading(false);
//     };

//     initializeAuth();
//   }, []);

//   const login = (accessToken, refreshToken, userData) => {
//     tokenService.setTokens(accessToken, refreshToken);
//     tokenService.setUserData(userData);
//     setIsAuthenticated(true);
//     setUser(userData);
//   };

//   const logout = () => {
//     tokenService.clearTokens();
//     setIsAuthenticated(false);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };