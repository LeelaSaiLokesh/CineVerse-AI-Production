require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const moviesRouter = require('./routes/movies');
const searchRouter = require('./routes/search');
const actorsRouter = require('./routes/actors');
const recommendationsRouter = require('./routes/recommendations');
const trendingRouter = require('./routes/trending');
const discoverRouter = require('./routes/discover');

const app = express();

// Security & performance middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')
);

// =========================
// ✅ FINAL CORS FIX
// =========================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// =========================
// Rate limiting
// =========================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    error: 'Too many requests, please try again later.',
  },
});

app.use('/api/', limiter);

// =========================
// Body parsers
// =========================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// Routes
// =========================

app.use('/api/movies', moviesRouter);
app.use('/api/search', searchRouter);
app.use('/api/actors', actorsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/trending', trendingRouter);
app.use('/api/discover', discoverRouter);

// =========================
// Health check
// =========================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CineVerse AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// =========================
// Root route
// =========================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎬 CineVerse AI Backend Running',
  });
});

// =========================
// 404 handler
// =========================

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

// =========================
// Global error handler
// =========================

app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
});

module.exports = app;