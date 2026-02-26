// ─────────────────────────────────────────────────
// Auth Controller — Business Logic
// ─────────────────────────────────────────────────

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// In-memory user store (replace with DB in production)
const users = new Map();

// Seed a default admin user
(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  users.set('admin', {
    id: 'usr-001',
    username: 'admin',
    email: 'admin@fraud-engine.dev',
    password: hash,
    role: 'admin',
    createdAt: new Date().toISOString(),
  });
})();

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ── Register ──────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'username, email, and password are required',
      });
    }

    if (users.has(username)) {
      return res.status(409).json({
        error: 'USER_EXISTS',
        message: `User '${username}' already exists`,
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = {
      id: `usr-${Date.now()}`,
      username,
      email,
      password: hash,
      role: 'analyst',
      createdAt: new Date().toISOString(),
    };

    users.set(username, user);

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Login ─────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'username and password are required',
      });
    }

    const user = users.get(username);
    if (!user) {
      return res.status(401).json({
        error: 'AUTH_FAILED',
        message: 'Invalid username or password',
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        error: 'AUTH_FAILED',
        message: 'Invalid username or password',
      });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Verify Token ──────────────────────────────────
exports.verify = (req, res) => {
  res.json({
    valid: true,
    user: req.user,
  });
};

// ── Get Current User ──────────────────────────────
exports.me = (req, res) => {
  const user = users.get(req.user.username);
  if (!user) {
    return res.status(404).json({ error: 'USER_NOT_FOUND' });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
};
