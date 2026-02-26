// ─────────────────────────────────────────────────
// API Gateway — Express Application
// ─────────────────────────────────────────────────
// Central entry point for all API requests.
// Routes to downstream microservices via proxy or direct forwarding.
// ─────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyRoutes } = require('./routes/proxy.routes');

const app = express();

// ── Security & Middleware ─────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// ── Rate Limiting ─────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many requests, please try again later',
  },
});
app.use('/api', limiter);

// ── Health Check ──────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    routes: [
      '/api/auth',
      '/api/transactions',
      '/api/alerts',
      '/api/analytics',
      '/api/graph',
    ],
  });
});

// ── Service Routes ────────────────────────────────
createProxyRoutes(app);

// ── 404 Handler ───────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ── Error Handler ─────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(`❌ [Gateway] ${req.method} ${req.path}:`, err.message);
  res.status(err.statusCode || 500).json({
    error: err.name || 'GATEWAY_ERROR',
    message: err.message || 'Internal gateway error',
  });
});

module.exports = app;
