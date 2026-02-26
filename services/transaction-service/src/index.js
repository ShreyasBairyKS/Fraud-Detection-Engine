// ─────────────────────────────────────────────────
// Transaction Service — Entry Point
// ─────────────────────────────────────────────────

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const app = require('./app');

const PORT = process.env.PORT_TRANSACTION || 3002;

app.listen(PORT, () => {
  console.log(`💳 Transaction Service running on port ${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/health`);
  console.log(`   POST:    http://localhost:${PORT}/transactions`);
});
