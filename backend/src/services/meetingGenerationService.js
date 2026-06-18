const { google } = require('googleapis');
const CalendarToken = require('../models/CalendarToken');
const { decrypt } = require('../utils/tokenEncryption');
const logger = require('../utils/logger');

const createGoogleMeet = async ({ title, startTime, endTime, organizerUserId, candidateEmail, interviewerEmail }) => {
  const tokenDoc = await CalendarToken.findOne({ user: organizerUserId, provider: 'google', isValid: true });
  if (!tokenDoc) throw new Error('Google Calendar not connected. Please connect Google Calendar in Settings first.');

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({ access_token: decrypt(tokenDoc.accessToken) });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const event = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    resource: {
      summary: title,
      start: { dateTime: new Date(startTime).toISOString() },
      end: { dateTime: new Date(endTime).toISOString() },
      attendees: [{ email: candidateEmail }, { email: interviewerEmail }],
      conferenceData: {
        createRequest: {
          requestId: `intervuex-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  const meetLink = event.data.hangoutLink
    || event.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri
    || event.data.conferenceData?.entryPoints?.[0]?.uri
    || event.data.htmlLink;

  if (!meetLink) {
    logger.error('Google Calendar event created but no Meet link in response. conferenceData: %s', JSON.stringify(event.data.conferenceData || {}));
    throw new Error('No Google Meet link returned. Ensure the Google Cloud project has Google Calendar API enabled, Meet is allowed for the calendar, and the OAuth user can create video conferences.');
  }

  return {
    meetingLink: meetLink,
    meetingId: event.data.conferenceData?.conferenceId || event.data.id,
    platform: 'google-meet',
    calendarEventId: event.data.id,
  };
};

const generateMeetingLink = async (platform, options) => {
  if (platform === 'google-meet') {
    try {
      return await createGoogleMeet(options);
    } catch (err) {
      logger.warn(`Google Meet creation failed: ${err.message}`);
      throw err;
    }
  }

  // Manual platform — no meeting link generated, HR will paste one later
  return {
    meetingLink: null,
    meetingId: null,
    platform: 'manual',
  };
};

module.exports = { generateMeetingLink, createGoogleMeet };
