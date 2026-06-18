const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  googleCompleteValidation,
} = require('../middleware/validation');
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  getGoogleAuthStatus,
  startGoogleAuth,
  googleAuthCallback,
  completeGoogleSignup,
} = require('../controllers/authController');

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.patch('/update-password', authenticate, updatePassword);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidation, resetPassword);
router.get('/google/status', getGoogleAuthStatus);
router.get('/google', startGoogleAuth);
router.get('/google/callback', googleAuthCallback);
router.post('/google/complete', authLimiter, googleCompleteValidation, completeGoogleSignup);

module.exports = router;
