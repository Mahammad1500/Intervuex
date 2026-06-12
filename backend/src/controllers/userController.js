const User = require('../models/User');
const Company = require('../models/Company');
const CalendarToken = require('../models/CalendarToken');
const Notification = require('../models/Notification');
const { sanitizeUser, buildPaginationMeta } = require('../utils/helpers');
const { createError } = require('../middleware/errorHandler');
const { emailMatchesCompanyDomains, escapeRegex } = require('../utils/companyEmail');
const { sendEmail } = require('../services/notificationService');
const { welcomeEmail } = require('../utils/emailTemplates');
const { logAudit } = require('../services/auditService');
const crypto = require('crypto');

const resolveCompanyForHr = async (companyId) => {
  if (!companyId) {
    return { error: 'Select a company workspace for HR users.' };
  }
  const company = await Company.findById(companyId);
  if (!company) return { error: 'Company workspace not found.' };
  return { company };
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    const filter = { role: { $in: ['admin', 'hr'] } };
    if (role && ['admin', 'hr'].includes(role)) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ firstName: re }, { lastName: re }, { email: re }];
    }
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('companyId', 'name spaceCode allowedEmailDomains')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: { users: users.map(sanitizeUser), pagination: buildPaginationMeta(total, page, limit) } });
  } catch (err) { next(err); }
};

const getUser = async (req, res, next) => {
  try {
    const requester = req.user;
    const targetId = req.params.id;
    if (requester.role !== 'admin' && requester._id.toString() !== targetId) {
      return next(createError('Access denied.', 403));
    }
    const user = await User.findById(targetId).populate('companyId', 'name spaceCode allowedEmailDomains');
    if (!user) return next(createError('User not found.', 404));
    res.json({ success: true, data: { user: sanitizeUser(user) } });
  } catch (err) { next(err); }
};

const createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, role, department, jobTitle, phone, companyId } = req.body;
    if (!['admin', 'hr'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Only admin and hr roles are allowed.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      if (!existing.isActive) {
        return res.status(409).json({
          success: false,
          message: 'This email belongs to a deactivated account. Reactivate it from Team or use a different email.',
        });
      }
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    let resolvedCompanyId = null;
    if (role === 'hr') {
      const { company, error } = await resolveCompanyForHr(companyId);
      if (error) return res.status(400).json({ success: false, message: error });
      const domainCheck = emailMatchesCompanyDomains(normalizedEmail, company.allowedEmailDomains);
      if (!domainCheck.ok) {
        return res.status(400).json({ success: false, message: domainCheck.message });
      }
      resolvedCompanyId = company._id;
    } else if (companyId) {
      return res.status(400).json({ success: false, message: 'Platform admins are not linked to a company workspace.' });
    }

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password: tempPassword,
      role,
      department,
      jobTitle,
      phone,
      companyId: resolvedCompanyId,
    });

    setImmediate(async () => {
      try {
        await sendEmail(normalizedEmail, welcomeEmail({ user, tempPassword }));
      } catch (err) { /* logged in notification service */ }
    });

    await logAudit({
      action: 'user_created',
      actor: req.user,
      targetType: 'user',
      targetId: user._id,
      targetLabel: normalizedEmail,
      metadata: { role },
      req,
    });

    const populated = await User.findById(user._id).populate('companyId', 'name spaceCode');
    res.status(201).json({
      success: true,
      message: 'User created and welcome email sent.',
      data: { user: sanitizeUser(populated), tempPassword },
    });
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, department, jobTitle, preferences, avatar, role, companyId } = req.body;
    const targetId = req.params.id;
    const requester = req.user;
    const isAdmin = requester.role === 'admin';

    if (!isAdmin && requester._id.toString() !== targetId) {
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

    if (isAdmin) {
      if (role !== undefined) {
        if (!['admin', 'hr'].includes(role)) {
          return res.status(400).json({ success: false, message: 'Invalid role.' });
        }
        if (user._id.toString() === requester._id.toString() && role !== 'admin') {
          return res.status(400).json({ success: false, message: 'You cannot remove your own admin role.' });
        }
        user.role = role;
      }

      const effectiveRole = role !== undefined ? role : user.role;
      if (effectiveRole === 'hr') {
        const newCompanyId = companyId !== undefined ? companyId : user.companyId;
        const { company, error } = await resolveCompanyForHr(newCompanyId);
        if (error) return res.status(400).json({ success: false, message: error });
        const domainCheck = emailMatchesCompanyDomains(user.email, company.allowedEmailDomains);
        if (!domainCheck.ok) {
          return res.status(400).json({
            success: false,
            message: `${domainCheck.message} Update company allowed domains or use a matching email.`,
          });
        }
        user.companyId = company._id;
      } else {
        user.companyId = null;
      }
    }

    await user.save({ validateBeforeSave: true });
    const populated = await User.findById(user._id).populate('companyId', 'name spaceCode');
    res.json({ success: true, message: 'Profile updated.', data: { user: sanitizeUser(populated) } });
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
    await logAudit({
      action: user.isActive ? 'user_activated' : 'user_deactivated',
      actor: req.user,
      targetType: 'user',
      targetId: user._id,
      targetLabel: user.email,
      req,
    });
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, data: { user: sanitizeUser(user) } });
  } catch (err) { next(err); }
};

const resendWelcomeEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(createError('User not found.', 404));
    if (!user.isActive) {
      return res.status(400).json({ success: false, message: 'Cannot resend welcome email to a deactivated user.' });
    }

    const tempPassword = crypto.randomBytes(8).toString('hex');
    user.password = tempPassword;
    await user.save();

    await sendEmail(user.email, welcomeEmail({ user, tempPassword }));

    await logAudit({
      action: 'welcome_email_resent',
      actor: req.user,
      targetType: 'user',
      targetId: user._id,
      targetLabel: user.email,
      req,
    });

    res.json({
      success: true,
      message: 'Welcome email sent with a new temporary password.',
      data: { tempPassword },
    });
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const user = await User.findById(targetId);
    if (!user) return next(createError('User not found.', 404));

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1 && user.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the only active admin. Add another admin first or deactivate instead.',
        });
      }
    }

    const email = user.email;
    await Promise.all([
      CalendarToken.deleteMany({ user: user._id }),
      Notification.deleteMany({ recipient: user._id }),
    ]);
    await User.findByIdAndDelete(user._id);

    await logAudit({
      action: 'user_deleted',
      actor: req.user,
      targetType: 'user',
      targetId: user._id,
      targetLabel: email,
      metadata: { role: user.role },
      req,
    });

    res.json({ success: true, message: 'User deleted permanently.' });
  } catch (err) { next(err); }
};

module.exports = { getUsers, getUser, createUser, updateUser, toggleUserStatus, resendWelcomeEmail, deleteUser };
