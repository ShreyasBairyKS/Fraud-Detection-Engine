// ─────────────────────────────────────────────────
// Transaction Service — Express Application
// ─────────────────────────────────────────────────
// Phase 2 will implement:
//   - Request validation (Joi schema)
//   - Account + Merchant + IP enrichment
//   - Redis Stream publishing (txn:incoming)
//   - Velocity counters in Redis
// ─────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ── Health Check ──────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'transaction-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Transaction Routes (Phase 2) ──────────────────
app.post('/transactions', (req, res) => {
  // TODO: Phase 2 — Full implementation
  res.status(501).json({
    error: 'NOT_IMPLEMENTED',
    message: 'Transaction processing will be implemented in Phase 2 (Weeks 3–4)',
    received: req.body,
  });
});

app.get('/transactions/:id', (req, res) => {
  // TODO: Phase 2 — Lookup transaction by ID
  res.status(501).json({
    error: 'NOT_IMPLEMENTED',
    message: 'Transaction lookup will be implemented in Phase 2',
  });
});

// ── Error Handler ─────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(`❌ [Transaction] ${req.method} ${req.path}:`, err.message);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
});

module.exports = app;
