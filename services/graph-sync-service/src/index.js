// ─────────────────────────────────────────────────
// Graph Sync Service — Entry Point
// ─────────────────────────────────────────────────
// Phase 2 will implement:
//   - Redis Stream consumer (txn:incoming)
//   - Entity extraction from transaction events
//   - Neo4j MERGE for Account, Device, IP nodes
//   - Relationship creation (USED, CONNECTED_FROM, MADE)
//   - Idempotent event replay
// ─────────────────────────────────────────────────

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(morgan('dev'));

const PORT = process.env.PORT_GRAPH_SYNC || 3003;

// ── Health Check ──────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service: 'graph-sync-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    consumerGroup: 'graph-sync-workers',
    stream: 'txn:incoming',
    implementation: 'Phase 2 — Week 4',
  });
});

app.listen(PORT, () => {
  console.log(`🔄 Graph Sync Service running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   ⏳ Stream consumer will be implemented in Phase 2`);
});

module.exports = app;
