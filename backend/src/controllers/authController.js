const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Company = require('../models/Company');
const { generateTokens } = require('../middleware/auth');
const { sanitizeUser } = require('../utils/helpers');
const { welcomeEmail } = require('../utils/emailTemplates');
const { sendEmail } = require('../services/notificationService');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, spaceCode } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered.' });

    if (role !== 'hr') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only HR managers can self-register.' 
      });
    }

    if (!spaceCode) {
      return res.status(400).json({ success: false, message: 'Space Code is required for HR registration.' });
    }

    const company = await Company.findOne({ spaceCode: spaceCode.toUpperCase().trim() });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Invalid Space Code. Please contact your administrator.' });
    }

    const user = await User.create({ firstName, lastName, email, password, role: 'hr', companyId: company._id });
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
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!['admin', 'hr'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'This account type is no longer supported. Please use an Admin or HR account.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact administrator.' });
    }

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

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
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
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    const { accessToken, refreshToken } = generateTokens(user._id);
    res.json({ success: true, message: 'Password updated.', data: { accessToken, refreshToken } });
  } catch (err) { next(err); }
};

module.exports = { register, login, refreshToken, logout, getMe, updatePassword };
