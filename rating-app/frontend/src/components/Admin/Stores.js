// frontend/src/components/Admin/Stores.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    const params = new URLSearchParams({ ...filters, sort_by: sortBy, order });
    axios.get(`/admin/stores?${params}`).then(res => setStores(res.data)).catch(() => {});
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
      <h1>Stores List</h1>
      <input name="name" placeholder="Name" onChange={handleFilterChange} />
      <input name="email" placeholder="Email" onChange={handleFilterChange} />
      <input name="address" placeholder="Address" onChange={handleFilterChange} />
      <table>
        <thead>
          <tr>
            <th onClick={() => toggleSort('name')}>Name</th>
            <th onClick={() => toggleSort('email')}>Email</th>
            <th onClick={() => toggleSort('address')}>Address</th>
            <th onClick={() => toggleSort('rating')}>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stores.map(store => (
            <tr key={store.id}>
              <td>{store.name}</td>
              <td>{store.email}</td>
              <td>{store.address}</td>
              <td>{store.rating}</td>
              <td><Link to={`/users/${store.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminStores;
