const nodemailer = require('nodemailer');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const User = require('../models/User');
const {
  interviewScheduledCandidate,
  interviewScheduledInterviewer,
  interviewReminder,
  interviewCancelled,
  interviewRescheduled,
} = require('../utils/emailTemplates');
const logger = require('../utils/logger');
const { addMinutes, subMinutes } = require('date-fns');

const createTransport = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false },
});

const sendEmail = async (to, { subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn(`[EMAIL SKIPPED] No SMTP credentials. Would send to: ${to} — Subject: ${subject}`);
    return { skipped: true };
  }
  const transporter = createTransport();
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Intervuex" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Email send failed to ${to}: ${err.message}`);
    throw err;
  }
};

const createNotification = async ({ recipient, interview, type, title, message, metadata = {} }) => {
  return Notification.create({ recipient, interview, type, title, message, metadata });
};

const notifyInterviewScheduled = async (interview) => {
  const candidateObj = { firstName: interview.candidateName || 'Candidate', email: interview.candidateEmail };
  const interviewerObj = { firstName: interview.interviewerName || 'Interviewer', email: interview.interviewerEmail };
  const meetingLink = interview.meetingLink || '#';

  const candidateTemplate = interviewScheduledCandidate({
    candidate: candidateObj, interviewer: interviewerObj, interview, meetingLink,
    role: interview.role, interviewType: interview.interviewType,
    startTime: interview.scheduledAt, duration: interview.duration,
  });
  const interviewerTemplate = interviewScheduledInterviewer({
    candidate: candidateObj, interviewer: interviewerObj, interview, meetingLink,
    role: interview.role, interviewType: interview.interviewType,
    startTime: interview.scheduledAt, duration: interview.duration,
  });

  const tasks = [
    sendEmail(interview.candidateEmail, candidateTemplate),
    sendEmail(interview.interviewerEmail, interviewerTemplate),
    createNotification({
      recipient: interview.scheduledBy,
      interview: interview._id,
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `${interview.interviewType} interview for ${interview.role} with ${interview.candidateName || interview.candidateEmail} has been scheduled.`,
    }),
  ];

  (interview.panelists || []).forEach((panelist) => {
    if (panelist.email && panelist.email !== interview.interviewerEmail) {
      const panelObj = { firstName: panelist.name || 'Panelist', email: panelist.email };
      tasks.push(sendEmail(panelist.email, interviewScheduledInterviewer({
        candidate: candidateObj,
        interviewer: panelObj,
        interview,
        meetingLink,
        role: interview.role,
        interviewType: interview.interviewType,
        startTime: interview.scheduledAt,
        duration: interview.duration,
      })));
    }
  });

  if (interview.scheduledBy) {
    const org = await User.findById(interview.scheduledBy);
    if (org?.email && org.preferences?.notifications?.email !== false
      && org.preferences?.notifications?.emailCopyToOrganizer !== false) {
      tasks.push(sendEmail(org.email, {
        subject: `Interview scheduled — ${interview.role || 'interview'}`,
        html: `<p>Your interview is scheduled. ${interview.candidateName || interview.candidateEmail} — ${interview.interviewType} for <strong>${interview.role || ''}</strong>. Time: ${new Date(interview.scheduledAt).toLocaleString()}</p>
          ${meetingLink && meetingLink !== '#' ? `<p>Link: <a href="${meetingLink}">${meetingLink}</a></p>` : '<p>Meeting link can be set on the interview in Intervuex.</p>'}
          <p>— Intervuex</p>`,
      }));
    }
  }
  await Promise.allSettled(tasks);
};

const notifyInterviewCancelled = async (interview, reason) => {
  const candidateObj = { firstName: interview.candidateName || 'Candidate' };
  const interviewerObj = { firstName: interview.interviewerName || 'Interviewer' };

  await Promise.allSettled([
    sendEmail(interview.candidateEmail, interviewCancelled({ recipient: candidateObj, interview, reason })),
    sendEmail(interview.interviewerEmail, interviewCancelled({ recipient: interviewerObj, interview, reason })),
    createNotification({
      recipient: interview.scheduledBy, interview: interview._id, type: 'interview_cancelled',
      title: 'Interview Cancelled', message: `Interview for ${interview.role} has been cancelled.`,
    }),
  ]);
};

const notifyInterviewRescheduled = async (interview, oldTime) => {
  const candidateObj = { firstName: interview.candidateName || 'Candidate' };
  const interviewerObj = { firstName: interview.interviewerName || 'Interviewer' };
  const newMeetingLink = interview.meetingLink || '#';

  await Promise.allSettled([
    sendEmail(interview.candidateEmail, interviewRescheduled({ recipient: candidateObj, interview, oldTime, newMeetingLink })),
    sendEmail(interview.interviewerEmail, interviewRescheduled({ recipient: interviewerObj, interview, oldTime, newMeetingLink })),
    createNotification({
      recipient: interview.scheduledBy, interview: interview._id, type: 'interview_rescheduled',
      title: 'Interview Rescheduled', message: `Interview for ${interview.role} has been rescheduled.`,
    }),
  ]);
};

const sendScheduledReminders = async () => {
  const now = new Date();
  const interviews = await Interview.find({
    status: { $in: ['scheduled', 'confirmed'] },
    scheduledAt: { $gte: now },
    'reminders.sent': false,
  });

  let sent = 0;
  for (const interview of interviews) {
    for (const reminder of interview.reminders) {
      if (reminder.sent) continue;
      const minutesBefore = reminder.type === '24h' ? 1440 : reminder.type === '1h' ? 60 : 15;
      const reminderTime = subMinutes(interview.scheduledAt, minutesBefore);
      const windowStart = subMinutes(now, 7);
      const windowEnd = addMinutes(now, 7);
      if (reminderTime >= windowStart && reminderTime <= windowEnd) {
        const candidateObj = { firstName: interview.candidateName || 'Candidate' };
        const interviewerObj = { firstName: interview.interviewerName || 'Interviewer' };
        await Promise.allSettled([
          sendEmail(interview.candidateEmail, interviewReminder({ recipient: candidateObj, interview, meetingLink: interview.meetingLink || '#', minutesBefore })),
          sendEmail(interview.interviewerEmail, interviewReminder({ recipient: interviewerObj, interview, meetingLink: interview.meetingLink || '#', minutesBefore })),
        ]);
        reminder.sent = true;
        reminder.sentAt = new Date();
        sent++;
      }
    }
    await interview.save();
  }
  if (sent > 0) logger.info(`[REMINDER] Sent ${sent} reminder(s).`);
};

module.exports = { sendEmail, createNotification, notifyInterviewScheduled, notifyInterviewCancelled, notifyInterviewRescheduled, sendScheduledReminders };
