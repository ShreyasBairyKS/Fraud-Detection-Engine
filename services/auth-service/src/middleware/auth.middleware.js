// ─────────────────────────────────────────────────
// Auth Middleware — JWT Verification
// ─────────────────────────────────────────────────
// Usage: const { authenticate, authorize } = require('./middleware/auth.middleware');
//        router.get('/protected', authenticate, handler);
//        router.get('/admin-only', authenticate, authorize('admin'), handler);
// ─────────────────────────────────────────────────

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

/**
 * Verify JWT token from Authorization header.
 * Sets req.user with decoded token payload.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'NO_TOKEN',
      message: 'Authorization header with Bearer token is required',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Token has expired, please login again',
      });
    }
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Invalid or malformed token',
    });
  }
}

/**
 * Authorize by role. Must be used after authenticate.
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'analyst')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'NOT_AUTHENTICATED',
        message: 'Authentication required before authorization',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Role '${req.user.role}' is not authorized. Required: ${roles.join(', ')}`,
      });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
