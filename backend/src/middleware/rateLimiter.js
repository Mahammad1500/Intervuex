const rateLimit = require('express-rate-limit');

const isDevelopment = process.env.NODE_ENV === 'development';

const generalLimiter = isDevelopment ? (req, res, next) => next() : rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = isDevelopment ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

const schedulingLimiter = isDevelopment ? (req, res, next) => next() : rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Scheduling rate limit exceeded. Please slow down.' },
});

module.exports = { generalLimiter, authLimiter, schedulingLimiter };
