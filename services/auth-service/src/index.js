// ─────────────────────────────────────────────────
// Auth Service — Entry Point
// ─────────────────────────────────────────────────

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const app = require('./app');

const PORT = process.env.PORT_AUTH || 3001;

app.listen(PORT, () => {
  console.log(`🔐 Auth Service running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
