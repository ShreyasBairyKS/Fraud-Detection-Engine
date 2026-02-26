// ─────────────────────────────────────────────────
// Detection Worker — Entry Point
// ─────────────────────────────────────────────────
// Phase 3 will implement:
//   - Redis Stream consumer (txn:incoming)
//   - Pluggable rule engine interface
//   - 12 fraud rules (amount, velocity, IP, graph-based)
//   - Neo4j queries (shared device, shared IP, fraud ring)
//   - Score normalization (0–100)
//   - Publish scored txn to txn:scored stream
// ─────────────────────────────────────────────────

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(morgan('dev'));

const PORT = process.env.PORT_DETECTION || 3004;

// ── Health Check ──────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'detection-worker',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    rulesLoaded: 0,
    consumerGroup: 'detection-workers',
    inputStream: 'txn:incoming',
    outputStream: 'txn:scored',
    implementation: 'Phase 3 — Week 5',
  });
});

app.listen(PORT, () => {
  console.log(`🔍 Detection Worker running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   ⏳ Rule engine will be implemented in Phase 3`);
});

module.exports = app;
