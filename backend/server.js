require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const I18nBackend = require('./middleware/i18n');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workerRoutes = require('./routes/workers');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const messageRoutes = require('./routes/messages');
const reviewRoutes = require('./routes/reviews');
const uploadRoutes = require('./routes/upload');
const languageRoutes = require('./routes/language');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize i18n
const i18n = new I18nBackend();
i18n.loadTranslations();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' ? true : (process.env.CORS_ORIGIN || 'http://localhost:8000'),
  credentials: true
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Internationalization middleware
app.use(i18n.middleware());

// Static files for uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Umukozi API Server',
    version: '1.0.0',
    description: 'Household worker connection platform API',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      workers: '/api/workers',
      jobs: '/api/jobs',
      applications: '/api/applications',
      messages: '/api/messages',
      reviews: '/api/reviews',
      upload: '/api/upload',
      language: '/api/language',
      payments: '/api/payments',
      health: '/api/health'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/language', languageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Umukozi API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Umukozi API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN}`);
});

module.exports = app;
