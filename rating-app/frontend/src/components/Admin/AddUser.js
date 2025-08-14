// frontend/src/components/Admin/AddUser.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('normal');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/admin/users', { name, email, password, address, role });
      alert('User added');
      navigate('/users');
    } catch (err) {
      alert('Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="normal">Normal</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Add User</button>
    </form>
  );
};

export default AddUser;
