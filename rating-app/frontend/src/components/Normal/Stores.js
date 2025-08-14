// frontend/src/components/Normal/Stores.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NormalStores = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('store_name');
  const [order, setOrder] = useState('asc');
  const [selectedStore, setSelectedStore] = useState(null);
  const [rating, setRating] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams({ search, sort_by: sortBy, order });
    axios.get(`/stores?${params}`).then(res => setStores(res.data)).catch(() => {});
  }, [search, sortBy, order]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const openRate = (storeId, currentRating) => {
    setSelectedStore(storeId);
    setRating(currentRating || 1);
  };

  const submitRating = async () => {
    try {
      await axios.post('/ratings', { store_id: selectedStore, rating });
      alert('Rating submitted');
      const params = new URLSearchParams({ search, sort_by: sortBy, order });
      const res = await axios.get(`/stores?${params}`);
      setStores(res.data);
      setSelectedStore(null);
    } catch (err) {
      alert('Failed');
    }
  };

  return (
    <div>
      <h1>Stores</h1>
      <input placeholder="Search by name or address" onChange={e => setSearch(e.target.value)} />
      <table>
        <thead>
          <tr>
            <th onClick={() => toggleSort('store_name')}>Store Name</th>
            <th onClick={() => toggleSort('address')}>Address</th>
            <th onClick={() => toggleSort('overall_rating')}>Overall Rating</th>
            <th>My Rating</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stores.map(store => (
            <tr key={store.id}>
              <td>{store.store_name}</td>
              <td>{store.address}</td>
              <td>{store.overall_rating}</td>
              <td>{store.my_rating || 'Not rated'}</td>
              <td>
                <button onClick={() => openRate(store.id, store.my_rating)}>
                  {store.my_rating ? 'Modify' : 'Submit'} Rating
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedStore && (
        <div>
          <select value={rating} onChange={e => setRating(parseInt(e.target.value))}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
          <button onClick={submitRating}>Submit</button>
          <button onClick={() => setSelectedStore(null)}>Cancel</button>
        </div>
      )}
      <a href="/password">Change Password</a>
    </div>
  );
};

export default NormalStores;
