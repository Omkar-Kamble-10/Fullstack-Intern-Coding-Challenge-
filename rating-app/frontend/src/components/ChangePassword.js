// frontend/src/components/ChangePassword.js
import React, { useState } from 'react';
import axios from 'axios';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/password', { old_password: oldPassword, new_password: newPassword });
      alert('Password changed');
    } catch (err) {
      alert('Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Old Password" required />
      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required />
      <button type="submit">Change</button>
    </form>
  );
};

export default ChangePassword;
