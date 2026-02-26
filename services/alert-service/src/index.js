// ─────────────────────────────────────────────────
// Alert Service — Entry Point
// ─────────────────────────────────────────────────
// Phase 3 will implement:
//   - Redis Stream consumer (txn:scored)
//   - Alert creation for MEDIUM/HIGH risk transactions
//   - Slack webhook notifications
//   - Email notifications (Nodemailer)
//   - Auto-blocklist (Redis sets)
//   - Dashboard API endpoints:
//     GET /alerts
//     GET /analytics/risk-summary
//     GET /graph/fraud-rings
// ─────────────────────────────────────────────────

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT_ALERT || 3005;

// ── Health Check ──────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'alert-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    consumerGroup: 'alert-workers',
    stream: 'txn:scored',
    implementation: 'Phase 3 — Week 6',
  });
});

// ── Alert Endpoints (Phase 3) ─────────────────────
app.get('/alerts', (req, res) => {
  res.status(501).json({
    error: 'NOT_IMPLEMENTED',
    message: 'Alert listing will be implemented in Phase 3 (Week 6)',
  });
});

// ── Analytics Endpoints (Phase 3) ─────────────────
app.get('/analytics/risk-summary', (req, res) => {
  res.status(501).json({
    error: 'NOT_IMPLEMENTED',
    message: 'Risk summary analytics will be implemented in Phase 3 (Week 6)',
  });
});

// ── Graph Endpoints (Phase 3) ─────────────────────
app.get('/graph/fraud-rings', (req, res) => {
  res.status(501).json({
    error: 'NOT_IMPLEMENTED',
    message: 'Fraud ring visualization will be implemented in Phase 3 (Week 6)',
  });
});

// ── Error Handler ─────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(`❌ [Alert] ${req.method} ${req.path}:`, err.message);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚨 Alert Service running on port ${PORT}`);
  console.log(`   Health:    http://localhost:${PORT}/health`);
  console.log(`   Alerts:    http://localhost:${PORT}/alerts`);
  console.log(`   Analytics: http://localhost:${PORT}/analytics/risk-summary`);
  console.log(`   Graph:     http://localhost:${PORT}/graph/fraud-rings`);
  console.log(`   ⏳ Full implementation in Phase 3`);
});

module.exports = app;
