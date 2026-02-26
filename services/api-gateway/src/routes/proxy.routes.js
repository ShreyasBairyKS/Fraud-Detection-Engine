// ─────────────────────────────────────────────────
// API Gateway — Proxy / Route Configuration
// ─────────────────────────────────────────────────
// In Phase 1 we use direct Express forwarding.
// In Phase 4 this can switch to http-proxy-middleware
// for true reverse-proxy behavior.
// ─────────────────────────────────────────────────

const { createProxyMiddleware } = require('http-proxy-middleware');

// Service URLs (configurable via env)
const SERVICES = {
  auth:        process.env.AUTH_SERVICE_URL        || 'http://localhost:3001',
  transaction: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3002',
  alert:       process.env.ALERT_SERVICE_URL       || 'http://localhost:3005',
};

function createProxyRoutes(app) {
  // ── Auth Service ────────────────────────────────
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: SERVICES.auth,
      changeOrigin: true,
      pathRewrite: { '^/api/auth': '/auth' },
      onError: (err, req, res) => {
        console.error('❌ Auth proxy error:', err.message);
        res.status(502).json({
          error: 'SERVICE_UNAVAILABLE',
          message: 'Auth Service is not reachable',
        });
      },
    })
  );

  // ── Transaction Service ─────────────────────────
  app.use(
    '/api/transactions',
    createProxyMiddleware({
      target: SERVICES.transaction,
      changeOrigin: true,
      pathRewrite: { '^/api/transactions': '/transactions' },
      onError: (err, req, res) => {
        console.error('❌ Transaction proxy error:', err.message);
        res.status(502).json({
          error: 'SERVICE_UNAVAILABLE',
          message: 'Transaction Service is not reachable',
        });
      },
    })
  );

  // ── Alert Service ───────────────────────────────
  app.use(
    '/api/alerts',
    createProxyMiddleware({
      target: SERVICES.alert,
      changeOrigin: true,
      pathRewrite: { '^/api/alerts': '/alerts' },
      onError: (err, req, res) => {
        console.error('❌ Alert proxy error:', err.message);
        res.status(502).json({
          error: 'SERVICE_UNAVAILABLE',
          message: 'Alert Service is not reachable',
        });
      },
    })
  );

  // ── Analytics (served by Alert Service in Phase 3) ──
  app.use(
    '/api/analytics',
    createProxyMiddleware({
      target: SERVICES.alert,
      changeOrigin: true,
      pathRewrite: { '^/api/analytics': '/analytics' },
      onError: (err, req, res) => {
        console.error('❌ Analytics proxy error:', err.message);
        res.status(502).json({
          error: 'SERVICE_UNAVAILABLE',
          message: 'Analytics endpoint is not reachable',
        });
      },
    })
  );

  // ── Graph Endpoints (served by Alert Service in Phase 3) ──
  app.use(
    '/api/graph',
    createProxyMiddleware({
      target: SERVICES.alert,
      changeOrigin: true,
      pathRewrite: { '^/api/graph': '/graph' },
      onError: (err, req, res) => {
        console.error('❌ Graph proxy error:', err.message);
        res.status(502).json({
          error: 'SERVICE_UNAVAILABLE',
          message: 'Graph endpoint is not reachable',
        });
      },
    })
  );

  console.log('📡 Proxy routes configured:');
  console.log(`   /api/auth         → ${SERVICES.auth}`);
  console.log(`   /api/transactions → ${SERVICES.transaction}`);
  console.log(`   /api/alerts       → ${SERVICES.alert}`);
  console.log(`   /api/analytics    → ${SERVICES.alert}`);
  console.log(`   /api/graph        → ${SERVICES.alert}`);
}

module.exports = { createProxyRoutes };
