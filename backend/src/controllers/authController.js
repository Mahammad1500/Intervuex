const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Company = require('../models/Company');
const { generateTokens } = require('../middleware/auth');
const { sanitizeUser } = require('../utils/helpers');
const { welcomeEmail, passwordResetEmail } = require('../utils/emailTemplates');
const { sendEmail } = require('../services/notificationService');
const { emailMatchesCompanyDomains } = require('../utils/companyEmail');
const { getGoogleLoginUrl, fetchGoogleProfile, isGoogleAuthConfigured } = require('../services/googleAuthService');
const { logAudit } = require('../services/auditService');

const signupTokenSecret = () => process.env.JWT_SECRET;

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, spaceCode } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      if (!existing.isActive) {
        return res.status(409).json({
          success: false,
          message: 'This email is deactivated. Contact your platform administrator.',
        });
      }
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    if (role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Only HR managers can self-register.',
      });
    }

    if (!spaceCode) {
      return res.status(400).json({ success: false, message: 'Space Code is required for HR registration.' });
    }

    const company = await Company.findOne({ spaceCode: spaceCode.toUpperCase().trim() });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Invalid Space Code. Please contact your administrator.' });
    }

    const domainCheck = emailMatchesCompanyDomains(normalizedEmail, company.allowedEmailDomains);
    if (!domainCheck.ok) {
      return res.status(400).json({ success: false, message: domainCheck.message });
    }

    const user = await User.create({
      firstName, lastName, email: normalizedEmail, password, role: 'hr', companyId: company._id,
      isEmailVerified: true,
    });
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: 'HR account created successfully.',
      data: { user: sanitizeUser(user), accessToken, refreshToken },
    });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() })
      .select('+password +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isLocked()) {
      const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked after too many failed attempts. Try again in ${mins} minute(s).`,
      });
    }

    if (!user.password || !(await user.comparePassword(password))) {
      await user.incLoginAttempts();
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!['admin', 'hr'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'This account type is no longer supported. Please use an Admin or HR account.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact administrator.' });
    }

    await user.resetLoginAttempts();
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Login successful.',
      data: { user: sanitizeUser(user), accessToken, refreshToken },
    });
  } catch (err) { next(err); }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Refresh token required.' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Refresh token expired. Please log in again.' });
    }
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: { user: sanitizeUser(user) } });
  } catch (err) { next(err); }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Set a password from your profile or use Continue with Google.' });
    }
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    const tokens = generateTokens(user._id);
    res.json({ success: true, message: 'Password updated.', data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } });
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email });
    const generic = { success: true, message: 'If that email exists, a reset link has been sent.' };
    if (!user || !user.isActive) return res.json(generic);

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    await sendEmail(user.email, passwordResetEmail({ user, resetUrl }));

    await logAudit({ action: 'password_reset_requested', actor: user, req });
    res.json(generic);
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or expired.' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    await logAudit({ action: 'password_reset_completed', actor: user, req });
    res.json({ success: true, message: 'Password updated. You can log in now.' });
  } catch (err) { next(err); }
};

const getGoogleAuthStatus = (req, res) => {
  res.json({ success: true, data: { enabled: isGoogleAuthConfigured() } });
};

const startGoogleAuth = (req, res) => {
  if (!isGoogleAuthConfigured()) {
    return res.status(503).json({ success: false, message: 'Google sign-in is not configured on this server.' });
  }
  const result = getGoogleLoginUrl();
  return res.redirect(result.url);
};

const googleAuthCallback = async (req, res, next) => {
  try {
    const { code, error } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    if (error || !code) {
      return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
    }

    const profile = await fetchGoogleProfile(code);
    if (!profile.email) {
      return res.redirect(`${clientUrl}/login?error=google_no_email`);
    }

    let user = await User.findOne({ $or: [{ googleId: profile.googleId }, { email: profile.email }] });

    if (user) {
      if (!user.isActive) {
        return res.redirect(`${clientUrl}/login?error=account_deactivated`);
      }
      if (!user.googleId) {
        user.googleId = profile.googleId;
        if (profile.avatar && !user.avatar) user.avatar = profile.avatar;
        user.isEmailVerified = true;
        await user.save({ validateBeforeSave: false });
      }
      const tokens = generateTokens(user._id);
      user.refreshToken = tokens.refreshToken;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      const payload = Buffer.from(JSON.stringify({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: sanitizeUser(user),
      })).toString('base64url');

      return res.redirect(`${clientUrl}/auth/google/callback?session=${payload}`);
    }

    const signupToken = jwt.sign({
      googleId: profile.googleId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar,
    }, signupTokenSecret(), { expiresIn: '15m' });

    return res.redirect(`${clientUrl}/auth/google/complete?token=${signupToken}`);
  } catch (err) {
    next(err);
  }
};

const completeGoogleSignup = async (req, res, next) => {
  try {
    const { signupToken, spaceCode } = req.body;
    if (!signupToken || !spaceCode) {
      return res.status(400).json({ success: false, message: 'Signup token and Space code are required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(signupToken, signupTokenSecret());
    } catch {
      return res.status(400).json({ success: false, message: 'Google signup session expired. Please try again.' });
    }

    const normalizedEmail = decoded.email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered. Sign in with Google instead.' });
    }

    const company = await Company.findOne({ spaceCode: String(spaceCode).toUpperCase().trim() });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Invalid Space code.' });
    }

    const domainCheck = emailMatchesCompanyDomains(normalizedEmail, company.allowedEmailDomains);
    if (!domainCheck.ok) {
      return res.status(400).json({ success: false, message: domainCheck.message });
    }

    const randomPassword = crypto.randomBytes(16).toString('hex');
    const user = await User.create({
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: normalizedEmail,
      password: randomPassword,
      googleId: decoded.googleId,
      avatar: decoded.avatar,
      role: 'hr',
      companyId: company._id,
      isEmailVerified: true,
    });

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    await logAudit({
      action: 'user_google_signup',
      actor: user,
      targetType: 'company',
      targetId: company._id,
      targetLabel: company.name,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Account created with Google.',
      data: { user: sanitizeUser(user), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
    });
  } catch (err) { next(err); }
};

module.exports = {
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
};
