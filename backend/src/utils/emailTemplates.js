const { formatDateTime } = require('./helpers');

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Intervuex</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; }
    .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); margin-top: 4px; font-size: 14px; }
    .body { padding: 36px; }
    .badge { display: inline-block; background: #ede9fe; color: #6366f1; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
    .detail-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; font-weight: 500; }
    .detail-value { color: #1e293b; font-weight: 600; text-align: right; max-width: 60%; }
    .cta-button { display: block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff !important; text-decoration: none; text-align: center; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 24px 0; }
    .footer { text-align: center; padding: 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    .footer a { color: #6366f1; text-decoration: none; }
    h2 { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    p { line-height: 1.6; color: #475569; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Intervuex</h1>
      <p>Automated Interview Scheduling Platform</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Intervuex. All rights reserved.</p>
      <p>You received this email because an interview was scheduled through Intervuex.</p>
    </div>
  </div>
</body>
</html>`;

const interviewScheduledCandidate = ({ candidate, interviewer, interview, meetingLink, role, interviewType, startTime, duration }) => ({
  subject: `Interview Scheduled — ${role} | ${formatDateTime(startTime, 'EEE, MMM d')}`,
  html: baseTemplate(`
    <span class="badge">Interview Confirmed</span>
    <h2>Your interview has been scheduled!</h2>
    <p>Hi ${candidate.firstName},</p>
    <p>Great news! Your interview for the <strong>${role}</strong> position has been scheduled. Here are the details:</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Role</span><span class="detail-value">${role}</span></div>
      <div class="detail-row"><span class="detail-label">Interview Type</span><span class="detail-value">${interviewType}</span></div>
      <div class="detail-row"><span class="detail-label">Date & Time</span><span class="detail-value">${formatDateTime(startTime, 'EEEE, MMMM d, yyyy')}<br/>${formatDateTime(startTime, 'h:mm a')}</span></div>
      <div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${duration} minutes</span></div>
      <div class="detail-row"><span class="detail-label">Interviewer</span><span class="detail-value">${interviewer.firstName}</span></div>
    </div>
    ${meetingLink && meetingLink !== '#' ? `<a href="${meetingLink}" class="cta-button">Join Interview</a>` : '<p style="color:#6366f1;font-weight:600;text-align:center;padding:14px 0;">Meeting link will be shared soon.</p>'}
    <p><strong>Instructions:</strong> Please join the meeting 5 minutes early. Have a stable internet connection and a quiet environment.</p>
    <p>If you need to reschedule, please contact the HR team at least 24 hours in advance.</p>
  `),
});

const interviewScheduledInterviewer = ({ candidate, interviewer, interview, meetingLink, role, interviewType, startTime, duration }) => ({
  subject: `Interview Scheduled — ${candidate.firstName} for ${role} | ${formatDateTime(startTime, 'EEE, MMM d')}`,
  html: baseTemplate(`
    <span class="badge">New Interview</span>
    <h2>You have an upcoming interview</h2>
    <p>Hi ${interviewer.firstName},</p>
    <p>You have been selected as the interviewer for the following session. Please review the details below:</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Candidate</span><span class="detail-value">${candidate.firstName} (${candidate.email})</span></div>
      <div class="detail-row"><span class="detail-label">Role</span><span class="detail-value">${role}</span></div>
      <div class="detail-row"><span class="detail-label">Interview Type</span><span class="detail-value">${interviewType}</span></div>
      <div class="detail-row"><span class="detail-label">Date & Time</span><span class="detail-value">${formatDateTime(startTime, 'EEEE, MMMM d, yyyy')}<br/>${formatDateTime(startTime, 'h:mm a')}</span></div>
      <div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${duration} minutes</span></div>
    </div>
    ${meetingLink && meetingLink !== '#' ? `<a href="${meetingLink}" class="cta-button">Join Interview</a>` : '<p style="color:#6366f1;font-weight:600;text-align:center;padding:14px 0;">Meeting link will be shared soon.</p>'}
    <p><strong>Note:</strong> Please be available 5 minutes before the scheduled time.</p>
  `),
});

const interviewReminder = ({ recipient, interview, meetingLink, minutesBefore }) => ({
  subject: `Reminder: Interview in ${minutesBefore} minutes`,
  html: baseTemplate(`
    <span class="badge">Reminder</span>
    <h2>Your interview starts in ${minutesBefore} minutes</h2>
    <p>Hi ${recipient.firstName},</p>
    <p>This is a reminder that your interview is starting soon.</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Role</span><span class="detail-value">${interview.role}</span></div>
      <div class="detail-row"><span class="detail-label">Starts At</span><span class="detail-value">${formatDateTime(interview.scheduledAt, 'h:mm a')}</span></div>
      <div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${interview.duration} minutes</span></div>
    </div>
    <a href="${meetingLink}" class="cta-button">Join Now</a>
  `),
});

const interviewCancelled = ({ recipient, interview, reason }) => ({
  subject: `Interview Cancelled — ${interview.role}`,
  html: baseTemplate(`
    <span class="badge" style="background:#fee2e2;color:#dc2626;">Cancelled</span>
    <h2>Interview Cancelled</h2>
    <p>Hi ${recipient.firstName},</p>
    <p>The following interview has been cancelled:</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Role</span><span class="detail-value">${interview.role}</span></div>
      <div class="detail-row"><span class="detail-label">Originally Scheduled</span><span class="detail-value">${formatDateTime(interview.scheduledAt, 'MMMM d, yyyy h:mm a')}</span></div>
      ${reason ? `<div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${reason}</span></div>` : ''}
    </div>
    <p>If you have any questions, please contact the HR team.</p>
  `),
});

const interviewRescheduled = ({ recipient, interview, oldTime, newMeetingLink }) => ({
  subject: `Interview Rescheduled — ${interview.role}`,
  html: baseTemplate(`
    <span class="badge" style="background:#fef3c7;color:#d97706;">Rescheduled</span>
    <h2>Interview Rescheduled</h2>
    <p>Hi ${recipient.firstName},</p>
    <p>Your interview has been rescheduled. Please find the updated details below:</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Role</span><span class="detail-value">${interview.role}</span></div>
      <div class="detail-row"><span class="detail-label">Previous Time</span><span class="detail-value"><s>${formatDateTime(oldTime, 'MMMM d, h:mm a')}</s></span></div>
      <div class="detail-row"><span class="detail-label">New Date & Time</span><span class="detail-value">${formatDateTime(interview.scheduledAt, 'EEEE, MMMM d, yyyy')}<br/>${formatDateTime(interview.scheduledAt, 'h:mm a')}</span></div>
      <div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${interview.duration} minutes</span></div>
    </div>
    <a href="${newMeetingLink}" class="cta-button">Join Interview</a>
  `),
});

const welcomeEmail = ({ user, tempPassword }) => ({
  subject: 'Welcome to Intervuex — Your Account is Ready',
  html: baseTemplate(`
    <span class="badge">Welcome</span>
    <h2>Welcome to Intervuex, ${user.firstName}!</h2>
    <p>Your account has been created. You can now access the Intervuex platform using the credentials below:</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${user.email}</span></div>
      <div class="detail-row"><span class="detail-label">Temporary Password</span><span class="detail-value">${tempPassword}</span></div>
      <div class="detail-row"><span class="detail-label">Role</span><span class="detail-value">${user.role}</span></div>
    </div>
    <a href="${process.env.CLIENT_URL}/login" class="cta-button">Login to Intervuex</a>
    <p>Please change your password after your first login for security.</p>
  `),
});

module.exports = {
  interviewScheduledCandidate,
  interviewScheduledInterviewer,
  interviewReminder,
  interviewCancelled,
  interviewRescheduled,
  welcomeEmail,
};
