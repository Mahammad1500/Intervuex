const { google } = require('googleapis');
const CalendarToken = require('../models/CalendarToken');
const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/tokenEncryption');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const getGoogleAuthUrl = (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    state: req.user._id.toString(),
  });
  res.json({ success: true, data: { url } });
};

const handleGoogleCallback = async (req, res, next) => {
  try {
    const { code, state: userId } = req.query;
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await oauth2Client.getToken(code);
    const expiresAt = new Date(tokens.expiry_date || Date.now() + 3600000);

    await CalendarToken.findOneAndUpdate(
      { user: userId, provider: 'google' },
      {
        user: userId,
        provider: 'google',
        accessToken: encrypt(tokens.access_token),
        refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined,
        expiresAt,
        scope: tokens.scope,
        isValid: true,
      },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(userId, { 'calendarConnected.google': true });
    res.redirect(`${process.env.CLIENT_URL}/settings?calendar=google&connected=true`);
  } catch (err) {
    logger.error('Google OAuth callback failed:', err.message);
    res.redirect(`${process.env.CLIENT_URL}/settings?calendar=google&error=true`);
  }
};

const disconnectCalendar = async (req, res, next) => {
  try {
    const { provider } = req.params;
    if (provider !== 'google') {
      return next(createError('Invalid provider. Only Google is supported.', 400));
    }
    await CalendarToken.findOneAndDelete({ user: req.user._id, provider });
    await User.findByIdAndUpdate(req.user._id, { 'calendarConnected.google': false });
    res.json({ success: true, message: 'Google Calendar disconnected.' });
  } catch (err) { next(err); }
};

const getCalendarStatus = async (req, res, next) => {
  try {
    const tokens = await CalendarToken.find({ user: req.user._id, isValid: true });
    const status = {
      google: tokens.some(t => t.provider === 'google'),
    };
    res.json({ success: true, data: { status } });
  } catch (err) { next(err); }
};

module.exports = {
  getGoogleAuthUrl, handleGoogleCallback,
  disconnectCalendar, getCalendarStatus,
};
