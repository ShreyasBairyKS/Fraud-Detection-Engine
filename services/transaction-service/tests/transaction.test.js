// ─────────────────────────────────────────────────
// Transaction Service — Tests
// ─────────────────────────────────────────────────

const request = require('supertest');
const app = require('../src/app');

describe('Transaction Service', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('transaction-service');
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('POST /transactions', () => {
    it('should return 501 (not yet implemented)', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({
          accountId: 'ACC-001',
          amount: 99.99,
          currency: 'USD',
          merchantId: 'MERCH-001',
        });

      expect(res.status).toBe(501);
      expect(res.body.error).toBe('NOT_IMPLEMENTED');
    });
  });
});
