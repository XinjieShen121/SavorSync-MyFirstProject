require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Import dual database connections
const { userDb, recipeDb } = require('./config/mongoose');

// Import routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const uploadRoutes = require('./routes/upload');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const communityRoutes = require('./routes/community');
const profileUploadRoutes = require('./routes/profileUpload');
const culturalRoutes = require('./routes/cultural');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/profile-upload', profileUploadRoutes);
app.use('/api/cultural', culturalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SavorSync API is running',
    databases: {
      user: userDb.readyState === 1 ? 'connected' : 'disconnected',
      recipe: recipeDb.readyState === 1 ? 'connected' : 'disconnected'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = 3001; // Back to port 3001 as requested

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🍽️  Recipe endpoints: http://localhost:${PORT}/api/recipes`);
  console.log(`📸 Upload endpoints: http://localhost:${PORT}/api/upload`);
  console.log(`🧠 Cultural insights: http://localhost:${PORT}/api/cultural`);
});