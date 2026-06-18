const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized. Invalid or expired token.' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    req.user = user;
    next();
  })(req, res, next);
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (!err && user) req.user = user;
    next();
  })(req, res, next);
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  return { accessToken, refreshToken };
};

module.exports = { authenticate, optionalAuth, generateTokens };
