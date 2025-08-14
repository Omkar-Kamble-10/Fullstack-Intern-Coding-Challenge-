// frontend/src/components/Admin/Users.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    const params = new URLSearchParams({ ...filters, sort_by: sortBy, order });
    axios.get(`/admin/users?${params}`).then(res => setUsers(res.data)).catch(() => {});
  }, [filters, sortBy, order]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  return (
    <div>
      <h1>Users List</h1>
      <input name="name" placeholder="Name" onChange={handleFilterChange} />
      <input name="email" placeholder="Email" onChange={handleFilterChange} />
      <input name="address" placeholder="Address" onChange={handleFilterChange} />
      <select name="role" onChange={handleFilterChange}>
        <option value="">All</option>
        <option value="normal">Normal</option>
        <option value="admin">Admin</option>
      </select>
      <table>
        <thead>
          <tr>
            <th onClick={() => toggleSort('name')}>Name {sortBy === 'name' && (order === 'asc' ? '↑' : '↓')}</th>
            <th onClick={() => toggleSort('email')}>Email</th>
            <th onClick={() => toggleSort('address')}>Address</th>
            <th onClick={() => toggleSort('role')}>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.address}</td>
              <td>{user.role}</td>
              <td><Link to={`/users/${user.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
