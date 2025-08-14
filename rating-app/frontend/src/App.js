// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';

import Login from './components/Login';
import Signup from './components/Signup';
import ChangePassword from './components/ChangePassword';
import AdminDashboard from './components/Admin/Dashboard';
import AdminUsers from './components/Admin/Users';
import AdminStores from './components/Admin/Stores';
import AddUser from './components/Admin/AddUser';
import AddStore from './components/Admin/AddStore';
import UserDetails from './components/Admin/UserDetails';
import NormalStores from './components/Normal/Stores';
import StoreOwnerDashboard from './components/StoreOwner/Dashboard';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const storedRole = localStorage.getItem('role');
      setRole(storedRole);
    }
  }, []);

  const login = (token, userRole) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole);
    setIsAuthenticated(true);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setRole(null);
  };

  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return (
    <Router>
      <div>
        <nav>
          {isAuthenticated && <button onClick={logout}>Logout</button>}
        </nav>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login login={login} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
          <Route path="/password" element={isAuthenticated ? <ChangePassword /> : <Navigate to="/login" />} />
          {isAuthenticated && role === 'admin' && (
            <>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/users" element={<AdminUsers />} />
              <Route path="/stores" element={<AdminStores />} />
              <Route path="/add-user" element={<AddUser />} />
              <Route path="/add-store" element={<AddStore />} />
              <Route path="/users/:id" element={<UserDetails />} />
            </>
          )}
          {isAuthenticated && role === 'normal' && (
            <>
              <Route path="/" element={<NormalStores />} />
            </>
          )}
          {isAuthenticated && role === 'store_owner' && (
            <>
              <Route path="/" element={<StoreOwnerDashboard />} />
            </>
          )}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
