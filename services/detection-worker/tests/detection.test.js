const request = require('supertest');
const app = require('../src/index');

describe('Detection Worker', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('detection-worker');
      expect(res.body.status).toBe('healthy');
    });
  });
});
