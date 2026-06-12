const { google } = require('googleapis');
const crypto = require('crypto');

const getOAuthClient = () => {
  const redirectUri = process.env.GOOGLE_AUTH_REDIRECT_URI
    || `${process.env.API_URL || 'http://localhost:5000'}/api/auth/google/callback`;
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri,
  );
};

const getGoogleLoginUrl = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return null;
  }
  const oauth2Client = getOAuthClient();
  const state = crypto.randomBytes(16).toString('hex');
  const url = oauth2Client.generateAuthUrl({
    access_type: 'online',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
    state,
  });
  return { url, state };
};

const fetchGoogleProfile = async (code) => {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  return {
    googleId: data.id,
    email: (data.email || '').toLowerCase().trim(),
    firstName: data.given_name || data.name?.split(' ')[0] || 'User',
    lastName: data.family_name || data.name?.split(' ').slice(1).join(' ') || '',
    avatar: data.picture || null,
    emailVerified: data.verified_email === true,
  };
};

const isGoogleAuthConfigured = () => Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

module.exports = { getGoogleLoginUrl, fetchGoogleProfile, isGoogleAuthConfigured };
