const express = require('express');
const cors = require('cors');
const connectDB = require('./database');
const blogRoutes = require('./routes/blogRoutes');
const followRoutes = require('./routes/followRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'BlogService',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/blogs', blogRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/comments', commentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    availableRoutes: [
      'GET /health',
      'GET /api/blogs',
      'GET /api/blogs/search',
      'GET /api/blogs/stats', 
      'GET /api/blogs/author/:authorId',
      'GET /api/blogs/:id',
      'POST /api/blogs',
      'PUT /api/blogs/:id',
      'DELETE /api/blogs/:id',
      'POST /api/follows',
      'DELETE /api/follows/:userId',
      'GET /api/follows/:userId/followers',
      'GET /api/follows/:userId/following',
      'GET /api/follows/:userId/stats',
      'GET /api/follows/check/:userId',
      'POST /api/comments/:blogId',
      'GET /api/comments/:blogId',
      'PUT /api/comments/comment/:commentId',
      'DELETE /api/comments/comment/:commentId',
      'GET /api/comments/user/:userId',
      'GET /api/comments/stats'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      details: err.message
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`BlogService running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});