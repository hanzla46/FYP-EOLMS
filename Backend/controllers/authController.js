const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');

const register = async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ error: 'All fields are required: username, email, password, full_name.' });
    }

    const validRoles = ['Admin', 'Vet', 'Worker'];
    const userRole = role || 'Worker';
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}.` });
    }

    const [existing] = await sequelize.query(
      'SELECT id FROM users WHERE username = :username OR email = :email',
      { replacements: { username, email } }
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sequelize.query(
      'INSERT INTO users (username, email, password, full_name, role) VALUES (:username, :email, :password, :full_name, :role)',
      { replacements: { username, email, password: hashedPassword, full_name, role: userRole } }
    );

    const [users] = await sequelize.query(
      'SELECT id, username, email, full_name, role, created_at FROM users WHERE username = :username',
      { replacements: { username } }
    );

    res.status(201).json({ message: 'User registered successfully.', data: users[0] });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [users] = await sequelize.query(
      'SELECT id, username, email, password, full_name, role, is_active FROM users WHERE email = :email',
      { replacements: { email } }
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { user_id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const me = async (req, res) => {
  try {
    const [users] = await sequelize.query(
      'SELECT id, username, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = :id',
      { replacements: { id: req.user.user_id } }
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'Profile retrieved.', data: users[0] });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const listUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let where = 'WHERE 1=1';
    const replacements = {};

    if (role) { where += ' AND role = :role'; replacements.role = role; }
    if (search) { where += ' AND (full_name LIKE :search OR username LIKE :search)'; replacements.search = `%${search}%`; }

    const [users] = await sequelize.query(
      `SELECT id, username, email, full_name, role, is_active, created_at FROM users ${where} ORDER BY full_name ASC`,
      { replacements }
    );

    res.json({ message: 'Users retrieved.', data: users, total: users.length });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { register, login, me, listUsers };