// ─────────────────────────────────────────────────
// Auth Routes — Login, Register, Verify
// ─────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /auth/register — Create new user
router.post('/register', authController.register);

// POST /auth/login — Authenticate and get JWT
router.post('/login', authController.login);

// GET /auth/verify — Verify JWT token validity
router.get('/verify', authenticate, authController.verify);

// GET /auth/me — Get current user info (protected)
router.get('/me', authenticate, authController.me);

module.exports = router;
