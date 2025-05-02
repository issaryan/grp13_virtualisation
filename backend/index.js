const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Import route handlers
const authRoutes = require('./routes/auth.routes');
const quizRoutes = require('./routes/quiz.routes');
const sessionRoutes = require('./routes/session.routes');
const resultRoutes = require('./routes/result.routes');

// Import WebSocket handlers
const socketHandler = require('./lambdas/socket-handler');

// In-memory database
const db = require('./db/dynamo-db');

// Initialize backend
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Authentication middleware
app.use((req, res, next) => {
  // Skip auth for login and register routes
  if (req.path === '/api/auth/login' || req.path === '/api/auth/register') {
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // In a real app, we'd verify the JWT token
  // For demo purposes, we'll just check if it exists in our "database"
  const user = db.getUserByToken(token);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  // Add user to request object
  req.user = user;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/results', resultRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Not found middleware
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Initialize socket handlers
socketHandler(io);

// Start backend
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Seed the database with initial data if needed
  if (process.env.NODE_ENV !== 'production') {
    require('./db/seed-data')();
  }
});

module.exports = server;
