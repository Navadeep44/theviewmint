const jwt = require('jsonwebtoken');

/**
 * Middleware: Verify JWT token and attach user to req.user
 */
const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token malformed.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    if (ex.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * Middleware: Require admin or superadmin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

/**
 * Middleware: Require superadmin role
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied. SuperAdmin only.' });
  }
  next();
};

/**
 * Middleware: Require creator role
 */
const requireCreator = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
  if (req.user.role !== 'creator') {
    return res.status(403).json({ error: 'Access denied. Creators only.' });
  }
  next();
};

module.exports = { auth, requireAdmin, requireSuperAdmin, requireCreator };
