const { google } = require('googleapis');
const CalendarToken = require('../models/CalendarToken');
const Interview = require('../models/Interview');
const { encrypt, decrypt } = require('../utils/tokenEncryption');
const logger = require('../utils/logger');

const getGoogleClient = async (userId) => {
  const tokenDoc = await CalendarToken.findOne({ user: userId, provider: 'google', isValid: true });
  if (!tokenDoc) return null;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  if (tokenDoc.isExpired()) {
    const refreshToken = decrypt(tokenDoc.refreshToken);
    if (!refreshToken) { tokenDoc.isValid = false; await tokenDoc.save(); return null; }
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      tokenDoc.accessToken = encrypt(credentials.access_token);
      tokenDoc.expiresAt = new Date(credentials.expiry_date);
      await tokenDoc.save();
      oauth2Client.setCredentials(credentials);
    } catch (err) {
      logger.error(`Google token refresh failed for user ${userId}: ${err.message}`);
      tokenDoc.isValid = false;
      await tokenDoc.save();
      return null;
    }
  } else {
    oauth2Client.setCredentials({ access_token: decrypt(tokenDoc.accessToken) });
  }
  return oauth2Client;
};

const createCalendarEvent = async (interview) => {
  const scheduledById = interview.scheduledBy?._id || interview.scheduledBy;
  const client = await getGoogleClient(scheduledById.toString());
  if (!client) {
    logger.info(`No Google Calendar connected for scheduler — skipping calendar event for interview ${interview._id}`);
    return;
  }

  const event = {
    summary: interview.title,
    description: `Interview Type: ${interview.interviewType}\nRole: ${interview.role}\nMeeting Link: ${interview.meetingLink || 'TBD'}`,
    start: { dateTime: interview.scheduledAt.toISOString(), timeZone: interview.timezone || 'UTC' },
    end: { dateTime: interview.endTime.toISOString(), timeZone: interview.timezone || 'UTC' },
    attendees: [
      { email: interview.candidateEmail, displayName: interview.candidateName || interview.candidateEmail },
      { email: interview.interviewerEmail, displayName: interview.interviewerName || interview.interviewerEmail },
    ],
    reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 1440 }, { method: 'popup', minutes: 15 }] },
  };

  try {
    const calendar = google.calendar({ version: 'v3', auth: client });
    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });
    await Interview.findByIdAndUpdate(interview._id, { 'calendarEventId.google': res.data.id });
    logger.info(`Google Calendar event created for interview ${interview._id}`);
  } catch (err) {
    logger.error(`Google Calendar event creation failed: ${err.message}`);
  }
};

const updateCalendarEvent = async (interview) => {
  const scheduledById = interview.scheduledBy?._id || interview.scheduledBy;
  const client = await getGoogleClient(scheduledById.toString());
  if (client && interview.calendarEventId?.google) {
    try {
      const calendar = google.calendar({ version: 'v3', auth: client });
      await calendar.events.patch({
        calendarId: 'primary',
        eventId: interview.calendarEventId.google,
        resource: {
          start: { dateTime: interview.scheduledAt.toISOString(), timeZone: interview.timezone },
          end: { dateTime: interview.endTime.toISOString(), timeZone: interview.timezone },
          summary: interview.title,
        },
        sendUpdates: 'all',
      });
    } catch (err) {
      logger.error(`Google Calendar event update failed: ${err.message}`);
    }
  }
};

const deleteCalendarEvent = async (interview) => {
  if (interview.calendarEventId?.google) {
    const scheduledById = interview.scheduledBy?._id || interview.scheduledBy;
    const client = await getGoogleClient(scheduledById.toString());
    if (client) {
      try {
        const calendar = google.calendar({ version: 'v3', auth: client });
        await calendar.events.delete({ calendarId: 'primary', eventId: interview.calendarEventId.google, sendUpdates: 'all' });
      } catch (err) {
        logger.error(`Google Calendar event delete failed: ${err.message}`);
      }
    }
  }
};

const calendarSyncService = {
  createCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
};

module.exports = { calendarSyncService, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent };
