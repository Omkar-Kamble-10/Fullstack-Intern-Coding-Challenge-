// frontend/src/components/StoreOwner/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StoreOwnerDashboard = () => {
  const [data, setData] = useState({ average_rating: 0, raters: [] });

  useEffect(() => {
    axios.get('/store/dashboard').then(res => setData(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1>Store Owner Dashboard</h1>
      <p>Average Rating: {data.average_rating}</p>
      <h2>Raters</h2>
      <table>
        <thead>
          <tr>
            <th>User Name</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {data.raters.map(rater => (
            <tr key={rater.id}>
              <td>{rater.name}</td>
              <td>{rater.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="/password">Change Password</a>
    </div>
  );
};

export default StoreOwnerDashboard;
