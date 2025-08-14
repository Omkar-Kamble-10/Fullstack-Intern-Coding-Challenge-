// backend/server.js
const express = require('express');
const pg = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = 3000;
const JWT_SECRET = 'secret'; // Change in production

const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rating_app',
  password: 'password', // Change to your DB password
  port: 5432,
});

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
};

const isNormal = (req, res, next) => {
  if (req.user.role !== 'normal') return res.status(403).json({ message: 'Forbidden' });
  next();
};

const isStoreOwner = (req, res, next) => {
  if (req.user.role !== 'store_owner') return res.status(403).json({ message: 'Forbidden' });
  next();
};

// Validation functions
const validateName = (name) => name && name.length >= 20 && name.length <= 60;
const validateAddress = (address) => !address || address.length <= 400;
const validatePassword = (password) => {
  if (!password || password.length < 8 || password.length > 16) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasUpper && hasSpecial;
};
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Signup for normal user
app.post('/signup', async (req, res) => {
  const { name, email, address, password } = req.body;
  if (!validateName(name)) return res.status(400).json({ message: 'Invalid name' });
  if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email' });
  if (!validateAddress(address)) return res.status(400).json({ message: 'Invalid address' });
  if (!validatePassword(password)) return res.status(400).json({ message: 'Invalid password' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, email, hashed, address, 'normal']
    );
    res.status(201).json({ message: 'User created', id: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Email exists' });
    res.status(500).json({ message: 'Error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// Update password
app.put('/password', authenticate, async (req, res) => {
  const { old_password, new_password } = req.body;
  if (!validatePassword(new_password)) return res.status(400).json({ message: 'Invalid new password' });
  try {
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const match = await bcrypt.compare(old_password, result.rows[0].password);
    if (!match) return res.status(401).json({ message: 'Invalid old password' });
    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// Admin add user
app.post('/admin/users', authenticate, isAdmin, async (req, res) => {
  const { name, email, password, address, role } = req.body;
  if (!['normal', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (!validateName(name)) return res.status(400).json({ message: 'Invalid name' });
  if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email' });
  if (!validateAddress(address)) return res.status(400).json({ message: 'Invalid address' });
  if (!validatePassword(password)) return res.status(400).json({ message: 'Invalid password' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, email, hashed, address, role]
    );
    res.status(201).json({ message: 'User added', id: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Email exists' });
    res.status(500).json({ message: 'Error' });
  }
});

// Admin add store
app.post('/admin/stores', authenticate, isAdmin, async (req, res) => {
  const { name, email, password, address } = req.body;
  if (!validateName(name)) return res.status(400).json({ message: 'Invalid name' });
  if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email' });
  if (!validateAddress(address)) return res.status(400).json({ message: 'Invalid address' });
  if (!validatePassword(password)) return res.status(400).json({ message: 'Invalid password' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, email, hashed, address, 'store_owner']
    );
    res.status(201).json({ message: 'Store added', id: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Email exists' });
    res.status(500).json({ message: 'Error' });
  }
});

// Admin dashboard
app.get('/admin/dashboard', authenticate, isAdmin, async (req, res) => {
  try {
    const totalUsers = await pool.query("SELECT COUNT(*) FROM users WHERE role IN ('normal', 'admin')");
    const totalStores = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'store_owner'");
    const totalRatings = await pool.query('SELECT COUNT(*) FROM ratings');
    res.json({
      total_users: parseInt(totalUsers.rows[0].count),
      total_stores: parseInt(totalStores.rows[0].count),
      total_ratings: parseInt(totalRatings.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// Admin list users
app.get('/admin/users', authenticate, isAdmin, async (req, res) => {
  const { name, email, address, role, sort_by = 'name', order = 'asc' } = req.query;
  let query = "SELECT id, name, email, address, role FROM users WHERE role IN ('normal', 'admin')";
  const params = [];
  if (name) {
    params.push(`%${name}%`);
    query += ` AND name ILIKE $${params.length}`;
  }
  if (email) {
    params.push(`%${email}%`);
    query += ` AND email ILIKE $${params.length}`;
  }
  if (address) {
    params.push(`%${address}%`);
    query += ` AND address ILIKE $${params.length}`;
  }
  if (role) {
    params.push(role);
    query += ` AND role = $${params.length}`;
  }
  if (['name', 'email', 'address', 'role'].includes(sort_by)) {
    query += ` ORDER BY ${sort_by} ${order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
  }
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// Admin list stores
app.get('/admin/stores', authenticate, isAdmin, async (req, res) => {
  const { name, email, address, sort_by = 'name', order = 'asc' } = req.query;
  let query = `SELECT u.id, u.name, u.email, u.address, 
    COALESCE(AVG(r.rating)::float, 0) as rating 
    FROM users u LEFT JOIN ratings r ON u.id = r.store_id 
    WHERE u.role = 'store_owner'`;
  const params = [];
  if (name) {
    params.push(`%${name}%`);
    query += ` AND u.name ILIKE $${params.length}`;
  }
  if (email) {
    params.push(`%${email}%`);
    query += ` AND u.email ILIKE $${params.length}`;
  }
  if (address) {
    params.push(`%${address}%`);
    query += ` AND u.address ILIKE $${params.length}`;
  }
  query += ` GROUP BY u.id`;
  if (['name', 'email', 'address', 'rating'].includes(sort_by)) {
    let sortField = sort_by === 'rating' ? 'rating' : sort_by;
    query += ` ORDER BY ${sortField} ${order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
  }
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// View user details
app.get('/users/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const userResult = await pool.query('SELECT name, email, address, role FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = userResult.rows[0];
    if (user.role === 'store_owner') {
      const ratingResult = await pool.query('SELECT AVG(rating)::float as rating FROM ratings WHERE store_id = $1', [id]);
      user.rating = ratingResult.rows[0].rating || 0;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// Normal user list stores
app.get('/stores', authenticate, isNormal, async (req, res) => {
  const { search, sort_by = 'name', order = 'asc' } = req.query;
  let query = `SELECT u.id, u.name as store_name, u.address, 
    COALESCE(AVG(r.rating)::float, 0) as overall_rating,
    (SELECT rating FROM ratings WHERE user_id = $1 AND store_id = u.id) as my_rating
    FROM users u LEFT JOIN ratings r ON u.id = r.store_id 
    WHERE u.role = 'store_owner'`;
  const params = [req.user.id];
  if (search) {
    const searchParam = `%${search}%`;
    query += ` AND (u.name ILIKE $2 OR u.address ILIKE $2)`;
    params.push(searchParam);
  }
  query += ` GROUP BY u.id`;
  if (['store_name', 'address', 'overall_rating'].includes(sort_by)) {
    let sortField = sort_by === 'store_name' ? 'name' : sort_by;
    query += ` ORDER BY ${sortField} ${order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
  }
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// Submit/modify rating
app.post('/ratings', authenticate, isNormal, async (req, res) => {
  const { store_id, rating } = req.body;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: 'Invalid rating' });
  try {
    const storeCheck = await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'store_owner'", [store_id]);
    if (storeCheck.rows.length === 0) return res.status(404).json({ message: 'Store not found' });
    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)
      ON CONFLICT (user_id, store_id) DO UPDATE SET rating = $3`,
      [req.user.id, store_id, rating]
    );
    res.json({ message: 'Rating submitted' });
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// Store owner dashboard
app.get('/store/dashboard', authenticate, isStoreOwner, async (req, res) => {
  try {
    const avgResult = await pool.query('SELECT AVG(rating)::float as average_rating FROM ratings WHERE store_id = $1', [req.user.id]);
    const average_rating = avgResult.rows[0].average_rating || 0;
    const ratersResult = await pool.query(
      'SELECT u.id, u.name, r.rating FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.store_id = $1',
      [req.user.id]
    );
    res.json({
      average_rating,
      raters: ratersResult.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
