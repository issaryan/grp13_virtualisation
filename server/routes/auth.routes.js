const express = require('express');
const router = express.Router();
const db = require('../db/in-memory-db');

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and return token
 * @access Public
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  
  const user = db.getUserByEmail(email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Generate token
  const token = db.createToken(user.id);
  
  // Remove password from response
  const { password: pwd, ...userWithoutPassword } = user;
  
  res.json({
    user: userWithoutPassword,
    token
  });
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;
  
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }
  
  // Check if user already exists
  const existingUser = db.getUserByEmail(email);
  
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }
  
  // Validate role
  if (role !== 'teacher' && role !== 'student') {
    return res.status(400).json({ message: 'Role must be either "teacher" or "student"' });
  }
  
  // Create user
  const newUser = db.createUser({
    email,
    password, // In a real app, this would be hashed
    firstName,
    lastName,
    role
  });
  
  // Generate token
  const token = db.createToken(newUser.id);
  
  // Remove password from response
  const { password: pwd, ...userWithoutPassword } = newUser;
  
  res.status(201).json({
    user: userWithoutPassword,
    token
  });
});

module.exports = router;
