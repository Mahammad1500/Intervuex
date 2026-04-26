const User = require('../models/User');
const { sanitizeUser, buildPaginationMeta } = require('../utils/helpers');
const { createError } = require('../middleware/errorHandler');
const { generateTokens } = require('../middleware/auth');
const { sendEmail } = require('../services/notificationService');
const { welcomeEmail } = require('../utils/emailTemplates');
const crypto = require('crypto');

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    const filter = { role: { $in: ['admin', 'hr'] } };
    if (role && ['admin', 'hr'].includes(role)) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ firstName: re }, { lastName: re }, { email: re }];
    }
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: { users: users.map(sanitizeUser), pagination: buildPaginationMeta(total, page, limit) } });
  } catch (err) { next(err); }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(createError('User not found.', 404));
    res.json({ success: true, data: { user: sanitizeUser(user) } });
  } catch (err) { next(err); }
};

const createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, role, department, jobTitle, phone } = req.body;
    if (!['admin', 'hr'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Only admin and hr roles are allowed.' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered.' });

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const user = await User.create({ firstName, lastName, email, password: tempPassword, role, department, jobTitle, phone });

    setImmediate(async () => {
      try {
        await sendEmail(email, welcomeEmail({ user, tempPassword }));
      } catch (err) {}
    });

    res.status(201).json({ success: true, message: 'User created and welcome email sent.', data: { user: sanitizeUser(user) } });
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, department, jobTitle, preferences, avatar } = req.body;
    const targetId = req.params.id;
    const requester = req.user;

    if (requester.role !== 'admin' && requester._id.toString() !== targetId) {
      return next(createError('Access denied.', 403));
    }

    const user = await User.findById(targetId);
    if (!user) return next(createError('User not found.', 404));

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences !== undefined) {
      const cur = user.preferences?.toObject ? user.preferences.toObject() : (user.preferences || {});
      const nextPrefs = { ...cur, ...preferences };
      if (preferences.notifications) {
        nextPrefs.notifications = { ...(cur.notifications || {}), ...preferences.notifications };
      }
      user.preferences = nextPrefs;
      user.markModified('preferences');
    }

    await user.save({ validateBeforeSave: true });
    res.json({ success: true, message: 'Profile updated.', data: { user: sanitizeUser(user) } });
  } catch (err) { next(err); }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(createError('User not found.', 404));
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account.' });
    }
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, data: { user: sanitizeUser(user) } });
  } catch (err) { next(err); }
};

module.exports = { getUsers, getUser, createUser, updateUser, toggleUserStatus };
