// ─────────────────────────────────────────────────
// Error Handler Middleware
// ─────────────────────────────────────────────────

function errorHandler(err, req, res, _next) {
  console.error(`❌ [${req.method}] ${req.path}:`, err.message);

  const statusCode = err.statusCode || 500;
  const response = {
    error: err.name || 'INTERNAL_ERROR',
    message: err.message || 'An unexpected error occurred',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = { errorHandler };
