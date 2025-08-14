// frontend/src/components/Admin/UserDetails.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState({});

  useEffect(() => {
    axios.get(`/users/${id}`).then(res => setUser(res.data)).catch(() => {});
  }, [id]);

  return (
    <div>
      <h1>User Details</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Address: {user.address}</p>
      <p>Role: {user.role}</p>
      {user.role === 'store_owner' && <p>Rating: {user.rating}</p>}
    </div>
  );
};

export default UserDetails;
