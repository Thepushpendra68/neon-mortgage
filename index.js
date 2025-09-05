require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

const dbManager = require('./config/database');
const { initializeSecureLandingModel } = require('./models/SecureLandingApplication');
const router = require('./routes');

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;

// Security headers
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));
} else {
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
}

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002',
      'http://localhost:4011', 'http://localhost:4012', 'http://localhost:4013', 'http://localhost:4014'
    ])
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));

// Parsers
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '8mb' }));
app.use(cookieParser());

// Rate limit (prod)
if (process.env.NODE_ENV === 'production') {
  const rateLimit = require('express-rate-limit');
  app.use('/api/', rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  }));
}

// Logs (prod)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

// API routes
app.use('/', router);

// Static assets if any
app.use('/public', express.static('public'));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Health
app.get('/health', (req, res) => {
  const dbStatus = dbManager.getConnectionStatus();
  res.json({ status: 'OK', timestamp: new Date().toISOString(), database: dbStatus });
});

// Errors
app.use((err, req, res, next) => {
  console.error('Application Error:', err);
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal Server Error', message: 'Please try again later.' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

async function startServer() {
  try {
    console.log('🚀 Starting Neon Mortgage (extracted)');
    await dbManager.connectMainDatabase();
    await dbManager.connectLandingDatabase();
    await initializeSecureLandingModel();

    const server = app.listen(PORT, () => {
      console.log(`✅ API: http://localhost:${PORT}/api`);
      console.log(`✅ Health: http://localhost:${PORT}/health`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} in use.`);
      } else {
        console.error('❌ Server error:', error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
