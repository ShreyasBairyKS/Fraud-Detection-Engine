// ─────────────────────────────────────────────────
// API Gateway — Entry Point
// ─────────────────────────────────────────────────

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const app = require('./app');

const PORT = process.env.PORT_GATEWAY || 3000;

app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
  console.log(`   Health:        http://localhost:${PORT}/health`);
  console.log(`   Auth:          http://localhost:${PORT}/api/auth/*`);
  console.log(`   Transactions:  http://localhost:${PORT}/api/transactions/*`);
  console.log(`   Alerts:        http://localhost:${PORT}/api/alerts/*`);
  console.log(`   Analytics:     http://localhost:${PORT}/api/analytics/*`);
  console.log(`   Graph:         http://localhost:${PORT}/api/graph/*`);
});
