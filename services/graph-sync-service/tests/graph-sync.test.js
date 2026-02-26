const request = require('supertest');
const app = require('../src/index');

describe('Graph Sync Service', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('graph-sync-service');
      expect(res.body.status).toBe('healthy');
    });
  });
});
