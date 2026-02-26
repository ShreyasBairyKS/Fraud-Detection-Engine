// ─────────────────────────────────────────────────
// Auth Service — Express Application
// ─────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// ── Middleware ─────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ── Health Check ──────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Routes ────────────────────────────────────────
app.use('/auth', authRoutes);

// ── Error Handler ─────────────────────────────────
app.use(errorHandler);

module.exports = app;
