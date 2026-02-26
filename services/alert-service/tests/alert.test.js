const request = require('supertest');
const app = require('../src/index');

describe('Alert Service', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('alert-service');
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('GET /alerts', () => {
    it('should return 501 (not yet implemented)', async () => {
      const res = await request(app).get('/alerts');
      expect(res.status).toBe(501);
    });
  });
});
