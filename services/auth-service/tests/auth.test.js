// ─────────────────────────────────────────────────
// Auth Service — Tests
// ─────────────────────────────────────────────────

const request = require('supertest');
const app = require('../src/app');

describe('Auth Service', () => {
  let token;

  // ── Health Check ──────────────────────────────────
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('auth-service');
      expect(res.body.status).toBe('healthy');
    });
  });

  // ── Register ──────────────────────────────────────
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user.role).toBe('analyst');
    });

    it('should reject duplicate username', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test2@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('USER_EXISTS');
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ username: 'incomplete' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  // ── Login ─────────────────────────────────────────
  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('admin');
      expect(res.body.user.role).toBe('admin');

      token = res.body.token; // save for later tests
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('AUTH_FAILED');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'nobody', password: 'pass' });

      expect(res.status).toBe(401);
    });
  });

  // ── Verify Token ──────────────────────────────────
  describe('GET /auth/verify', () => {
    it('should verify a valid token', async () => {
      const res = await request(app)
        .get('/auth/verify')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.user.username).toBe('admin');
    });

    it('should reject missing token', async () => {
      const res = await request(app).get('/auth/verify');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('NO_TOKEN');
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('INVALID_TOKEN');
    });
  });

  // ── Protected Route ───────────────────────────────
  describe('GET /auth/me', () => {
    it('should return current user info', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.username).toBe('admin');
      expect(res.body.email).toBe('admin@fraud-engine.dev');
    });
  });
});
