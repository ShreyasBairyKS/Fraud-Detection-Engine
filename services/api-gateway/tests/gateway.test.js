// ─────────────────────────────────────────────────
// API Gateway — Tests
// ─────────────────────────────────────────────────

const request = require('supertest');

// We test the gateway app in isolation (proxy will fail, but health works)
// Full integration tests are in Phase 4
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: () => (req, res) => {
    res.status(502).json({ error: 'SERVICE_UNAVAILABLE', message: 'Mocked proxy' });
  },
}));

const app = require('../src/app');

describe('API Gateway', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('api-gateway');
      expect(res.body.status).toBe('healthy');
      expect(res.body.routes).toContain('/api/auth');
      expect(res.body.routes).toContain('/api/transactions');
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/unknown/route');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });
  });

  describe('Proxy routes (mocked)', () => {
    it('should forward /api/auth to auth service', async () => {
      const res = await request(app).post('/api/auth/login');
      expect(res.status).toBe(502); // mocked proxy
    });

    it('should forward /api/transactions', async () => {
      const res = await request(app).post('/api/transactions');
      expect(res.status).toBe(502); // mocked proxy
    });
  });
});
