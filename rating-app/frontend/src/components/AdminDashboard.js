// frontend/src/components/Admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    axios.get('/admin/dashboard').then(res => setData(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Total Users: {data.total_users}</p>
      <p>Total Stores: {data.total_stores}</p>
      <p>Total Ratings: {data.total_ratings}</p>
      <a href="/users">View Users</a><br />
      <a href="/stores">View Stores</a><br />
      <a href="/add-user">Add User</a><br />
      <a href="/add-store">Add Store</a><br />
      <a href="/password">Change Password</a>
    </div>
  );
};

export default AdminDashboard;
