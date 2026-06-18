const jwt = require('jsonwebtoken');
const User = require('../models/User');

const OPEN_MUTATION_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/google',
  '/auth/google/callback',
];

const demoReadOnly = async (req, res, next) => {
  if (process.env.DEMO_READ_ONLY_MODE !== 'true') return next();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

  const path = req.path.replace(/^\/api/, '') || req.path;
  if (OPEN_MUTATION_PATHS.some((p) => path.startsWith(p))) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('email');
    if (!user?.email) return next();

    const demoEmails = (process.env.DEMO_VIEW_ONLY_EMAILS || 'admin@intervuex.com,hr@intervuex.com')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (demoEmails.includes(user.email.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: 'Demo account is view-only on the live site. Browse freely — create, edit, and delete are disabled.',
        code: 'DEMO_READ_ONLY',
      });
    }
  } catch (_) {
    /* not a demo user or invalid token — route handler will respond */
  }
  next();
};

module.exports = demoReadOnly;
