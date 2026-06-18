const Interview = require('../models/Interview');
const User = require('../models/User');
const Company = require('../models/Company');
const { schedulingEngine } = require('../services/schedulingEngine');
const { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = require('../services/calendarSyncService');
const { generateMeetingLink } = require('../services/meetingGenerationService');
const { notifyInterviewScheduled, notifyInterviewCancelled, notifyInterviewRescheduled } = require('../services/notificationService');
const { buildPaginationMeta } = require('../utils/helpers');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const canAccessInterview = (user, interview) => {
  if (!user || !interview) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'hr' && interview.companyId && user.companyId) {
    return String(interview.companyId) === String(user.companyId);
  }
  return false;
};

const buildReminderList = (prefs) => {
  const n = prefs?.notifications || {};
  const out = [];
  if (n.reminder24h !== false) out.push({ type: '24h', sent: false, sentAt: null });
  if (n.reminder1h !== false) out.push({ type: '1h', sent: false, sentAt: null });
  if (n.reminder15 === true) out.push({ type: '15min', sent: false, sentAt: null });
  if (out.length === 0) return [{ type: '1h', sent: false, sentAt: null }];
  return out;
};

const scheduleInterview = async (req, res, next) => {
  try {
    const {
      candidateEmail, candidateName, interviewerEmail, interviewerName,
      role, interviewType, duration, scheduledAt, timezone, meetingPlatform, notes,
      meetingLink: manualLinkFromBody, companyId: companyIdFromBody, panelists: panelistsRaw,
    } = req.body;

    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + parseInt(duration, 10));

    const leadEmail = interviewerEmail.toLowerCase().trim();
    const panelists = (Array.isArray(panelistsRaw) ? panelistsRaw : [])
      .map((p) => ({
        email: String(p.email || '').toLowerCase().trim(),
        name: String(p.name || '').trim(),
      }))
      .filter((p) => p.email && p.email !== leadEmail);

    const allParticipants = [leadEmail, ...panelists.map((p) => p.email)];
    const conflict = await schedulingEngine.checkPanelConflicts(allParticipants, startTime, endTime);
    if (conflict.hasConflict) {
      return res.status(409).json({
        success: false,
        message: `Scheduling conflict for ${conflict.details.email || 'a participant'}.`,
        conflict: conflict.details,
      });
    }

    const platform = meetingPlatform || 'manual';
    let meetingResult = { meetingLink: null, meetingId: null };

    if (platform === 'manual' && manualLinkFromBody) {
      meetingResult = { meetingLink: String(manualLinkFromBody).trim(), meetingId: null, platform: 'manual' };
    } else if (platform === 'google-meet') {
      return res.status(400).json({
        success: false,
        message: 'Google Meet auto-generation is disabled. Choose Manual and paste a meeting link.',
      });
    }

    let companyId = req.user.companyId;
    if (req.user.role === 'admin') {
      if (!companyIdFromBody) {
        return res.status(400).json({ success: false, message: 'Select a company workspace (companyId) when scheduling as admin.' });
      }
      const c = await Company.findById(companyIdFromBody);
      if (!c) {
        return res.status(400).json({ success: false, message: 'Invalid company workspace.' });
      }
      companyId = c._id;
    }

    if (!companyId && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Your account is not associated with a company. Contact your administrator.' });
    }

    const planner = await User.findById(req.user._id);
    const reminderRows = buildReminderList(planner?.preferences);

    const interview = await Interview.create({
      title: role,
      role,
      interviewType,
      candidateEmail: candidateEmail.toLowerCase().trim(),
      candidateName: candidateName || '',
      interviewerEmail: leadEmail,
      interviewerName: interviewerName || '',
      panelists,
      isPanelInterview: panelists.length > 0,
      companyId,
      scheduledBy: req.user._id,
      scheduledAt: startTime,
      endTime,
      duration: parseInt(duration, 10),
      timezone: timezone || 'UTC',
      meetingPlatform: platform,
      meetingLink: meetingResult.meetingLink,
      meetingId: meetingResult.meetingId,
      status: 'scheduled',
      notes: notes || null,
      reminders: reminderRows,
    });

    // Non-blocking background tasks
    notifyInterviewScheduled(interview).catch(err =>
      logger.error('Email notification failed:', err.message)
    );
    createCalendarEvent(interview).catch(err =>
      logger.error('Calendar event failed:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully.',
      data: { interview },
    });
  } catch (err) { next(err); }
};

const getInterviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, interviewType, role: roleFilter, search, from, to, sortBy = 'scheduledAt', sortOrder = 'desc' } = req.query;
    const user = req.user;
    let filter = {};

    if (user.role === 'admin') {
      // Admin sees all interviews across all companies
    } else if (user.role === 'hr') {
      if (!user.companyId) {
        return res.json({
          success: true,
          data: { interviews: [], pagination: buildPaginationMeta(0, page, limit) },
        });
      }
      filter.companyId = user.companyId;
    }

    if (status) filter.status = status;
    if (interviewType) filter.interviewType = interviewType;
    if (roleFilter) filter.role = new RegExp(roleFilter, 'i');
    if (search) {
      filter.$or = [
        { candidateEmail: new RegExp(search, 'i') },
        { candidateName: new RegExp(search, 'i') },
        { interviewerEmail: new RegExp(search, 'i') },
        { interviewerName: new RegExp(search, 'i') },
        { role: new RegExp(search, 'i') },
      ];
    }
    if (from || to) {
      filter.scheduledAt = {};
      if (from) filter.scheduledAt.$gte = new Date(from);
      if (to) filter.scheduledAt.$lte = new Date(to);
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;
    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .populate('scheduledBy', 'firstName lastName email')
        .sort(sort).skip(skip).limit(parseInt(limit)),
      Interview.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { interviews, pagination: buildPaginationMeta(total, page, limit) },
    });
  } catch (err) { next(err); }
};

const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('scheduledBy', 'firstName lastName email')
      .populate('rescheduledFrom');

    if (!interview) return next(createError('Interview not found.', 404));

    if (!canAccessInterview(req.user, interview)) {
      return next(createError('Access denied.', 403));
    }

    res.json({ success: true, data: { interview } });
  } catch (err) { next(err); }
};

const cancelInterview = async (req, res, next) => {
  try {
    if (!['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only Admin and HR can cancel interviews.' });
    }

    const { reason } = req.body;
    const interview = await Interview.findById(req.params.id);

    if (!interview) return next(createError('Interview not found.', 404));
    if (!canAccessInterview(req.user, interview)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (interview.status === 'cancelled') return res.status(400).json({ success: false, message: 'Interview is already cancelled.' });

    interview.status = 'cancelled';
    interview.cancellationReason = reason || null;
    await interview.save();

    deleteCalendarEvent(interview).catch(err =>
      logger.error('Calendar event delete failed:', err.message)
    );
    notifyInterviewCancelled(interview, reason).catch(err =>
      logger.error('Cancel notification failed:', err.message)
    );

    res.json({ success: true, message: 'Interview cancelled.', data: { interview } });
  } catch (err) { next(err); }
};

const rescheduleInterview = async (req, res, next) => {
  try {
    if (!['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only Admin and HR can reschedule interviews.' });
    }

    const { scheduledAt, duration, reason } = req.body;
    const original = await Interview.findById(req.params.id);

    if (!original) return next(createError('Interview not found.', 404));
    if (!canAccessInterview(req.user, original)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (['cancelled', 'completed'].includes(original.status)) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule a cancelled or completed interview.' });
    }

    const newStart = new Date(scheduledAt);
    const newDuration = duration || original.duration;
    const newEnd = new Date(newStart);
    newEnd.setMinutes(newEnd.getMinutes() + newDuration);

    const conflict = await schedulingEngine.checkConflicts(original.interviewerEmail, newStart, newEnd, original._id);
    if (conflict.hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'Interviewer has a conflict at the new time.',
        conflict: conflict.details,
      });
    }

    let meetingResult = { meetingLink: null, meetingId: null };
    try {
      meetingResult = await generateMeetingLink(original.meetingPlatform, {
        title: original.title,
        startTime: newStart,
        endTime: newEnd,
        candidateEmail: original.candidateEmail,
        interviewerEmail: original.interviewerEmail,
        organizerUserId: req.user._id,
      });
    } catch (err) {
      logger.warn('Meeting link generation failed on reschedule:', err.message);
    }

    const oldTime = original.scheduledAt;
    original.status = 'rescheduled';
    original.rescheduledAt = new Date();

    const rescheduled = await Interview.create({
      title: original.title,
      role: original.role,
      interviewType: original.interviewType,
      candidateEmail: original.candidateEmail,
      candidateName: original.candidateName,
      interviewerEmail: original.interviewerEmail,
      interviewerName: original.interviewerName,
      companyId: original.companyId,
      scheduledBy: req.user._id,
      scheduledAt: newStart,
      endTime: newEnd,
      duration: newDuration,
      timezone: original.timezone,
      meetingPlatform: original.meetingPlatform,
      meetingLink: meetingResult.meetingLink,
      meetingId: meetingResult.meetingId,
      status: 'scheduled',
      notes: original.notes,
      rescheduledFrom: original._id,
      feedbackSubmitted: false,
      candidateConfirmed: false,
      reminders: [
        { type: '24h', sent: false },
        { type: '1h', sent: false },
        { type: '15min', sent: false },
      ],
    });
    await original.save();

    updateCalendarEvent(rescheduled).catch(err =>
      logger.error('Calendar event update failed:', err.message)
    );
    notifyInterviewRescheduled(rescheduled, oldTime).catch(err =>
      logger.error('Reschedule notification failed:', err.message)
    );

    res.json({ success: true, message: 'Interview rescheduled.', data: { interview: rescheduled } });
  } catch (err) { next(err); }
};

const confirmAttendance = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      confirmationToken: req.params.token,
      scheduledAt: { $gt: new Date() },
    });

    if (!interview) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html><head><title>Intervuex</title><style>body{font-family:system-ui;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f8fafc;margin:0}div{text-align:center;padding:2rem;max-width:400px}.icon{font-size:3rem;margin-bottom:1rem}h1{color:#334155;font-size:1.5rem}p{color:#64748b}</style></head>
        <body><div><div class="icon">⚠️</div><h1>Invalid or Expired Link</h1><p>This confirmation link is no longer valid. The interview may have already passed or the link has expired.</p></div></body></html>
      `);
    }

    interview.candidateConfirmed = true;
    interview.candidateConfirmedAt = new Date();
    if (interview.status === 'scheduled') interview.status = 'confirmed';
    await interview.save();

    const date = interview.scheduledAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const time = interview.scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const meetingInfo = interview.meetingLink
      ? `<p><a href="${interview.meetingLink}" style="color:#6366f1;font-weight:600">Join Meeting</a></p>`
      : `<p style="color:#64748b">Meeting link will be shared by HR.</p>`;

    res.send(`
      <!DOCTYPE html>
      <html><head><title>Attendance Confirmed | Intervuex</title><style>body{font-family:system-ui;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f8fafc;margin:0}div{text-align:center;padding:2rem;max-width:480px;background:white;border-radius:1rem;box-shadow:0 1px 3px rgba(0,0,0,.1)}.icon{font-size:3rem;margin-bottom:1rem}h1{color:#334155;font-size:1.5rem}p{color:#64748b;line-height:1.6}.brand{color:#6366f1;font-weight:700}</style></head>
      <body><div>
        <div class="icon">✅</div>
        <h1>Attendance Confirmed!</h1>
        <p>Thank you for confirming your attendance.</p>
        <p><strong>Your interview is on ${date} at ${time}.</strong></p>
        ${meetingInfo}
        <p style="margin-top:2rem;font-size:.875rem">— <span class="brand">Intervuex</span></p>
      </div></body></html>
    `);
  } catch (err) { next(err); }
};

const getInterviewByFeedbackToken = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      feedbackToken: req.params.token,
      scheduledAt: { $lt: new Date() },
    }).populate('scheduledBy', 'firstName lastName email');

    if (!interview) {
      return res.status(400).json({ success: false, message: 'Invalid or expired feedback link.' });
    }

    res.json({ success: true, data: { interview } });
  } catch (err) { next(err); }
};

const updateMeetingLink = async (req, res, next) => {
  try {
    if (!['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only Admin and HR can update meeting links.' });
    }

    const { meetingLink } = req.body;
    if (!meetingLink) {
      return res.status(400).json({ success: false, message: 'Meeting link is required.' });
    }

    const found = await Interview.findById(req.params.id);
    if (!found) return next(createError('Interview not found.', 404));
    if (!canAccessInterview(req.user, found)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { meetingLink },
      { new: true }
    );

    res.json({ success: true, message: 'Meeting link updated.', data: { interview } });
  } catch (err) { next(err); }
};

const getUpcomingInterviews = async (req, res, next) => {
  try {
    const user = req.user;
    const now = new Date();
    let filter = { scheduledAt: { $gte: now }, status: { $in: ['scheduled', 'confirmed'] } };

    if (user.role === 'hr') {
      if (user.companyId) filter.companyId = user.companyId;
      else {
        return res.json({ success: true, data: { interviews: [] } });
      }
    }

    const interviews = await Interview.find(filter)
      .populate('scheduledBy', 'firstName lastName email')
      .sort({ scheduledAt: 1 })
      .limit(10);

    res.json({ success: true, data: { interviews } });
  } catch (err) { next(err); }
};

const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return next(createError('Interview not found.', 404));
    if (!canAccessInterview(req.user, interview)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (['cancelled', 'completed', 'rescheduled'].includes(interview.status)) {
      return res.status(400).json({ success: false, message: 'Cannot edit this interview. Use schedule a new one or reschedule if still active.' });
    }

    const {
      candidateEmail, candidateName, interviewerEmail, interviewerName, role, interviewType,
      duration, scheduledAt, meetingPlatform, meetingLink, timezone, notes,
    } = req.body;

    const newStart = scheduledAt != null ? new Date(scheduledAt) : new Date(interview.scheduledAt);
    const newDuration = duration != null ? parseInt(duration, 10) : interview.duration;
    if (Number.isNaN(newStart.getTime()) || newStart < new Date(Date.now() + 5 * 60 * 1000)) {
      return res.status(400).json({ success: false, message: 'Start time must be in the future.' });
    }
    const newEnd = new Date(newStart);
    newEnd.setMinutes(newEnd.getMinutes() + newDuration);

    const iEmail = interviewerEmail != null ? interviewerEmail.toLowerCase().trim() : interview.interviewerEmail;
    const conflict = await schedulingEngine.checkConflicts(iEmail, newStart, newEnd, interview._id);
    if (conflict.hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'Interviewer has a scheduling conflict at this time.',
        conflict: conflict.details,
      });
    }

    const nextPlatform = meetingPlatform != null ? meetingPlatform : interview.meetingPlatform;
    const platformChanged = meetingPlatform != null && meetingPlatform !== interview.meetingPlatform;
    const timeChanged = scheduledAt != null || (duration != null && parseInt(duration, 10) !== interview.duration);
    let meetingResult = { meetingLink: interview.meetingLink, meetingId: interview.meetingId };

    if (meetingLink != null) {
      const trimmed = String(meetingLink).trim();
      if (trimmed === '') {
        meetingResult.meetingLink = null;
      } else {
        try {
          // eslint-disable-next-line no-new
          new URL(trimmed);
          meetingResult.meetingLink = trimmed;
        } catch {
          return res.status(400).json({ success: false, message: 'Invalid meeting link URL' });
        }
      }
    }
    if (nextPlatform === 'google-meet' && (timeChanged || platformChanged || !interview.meetingLink) && (meetingLink == null || !String(meetingLink).trim())) {
      try {
        const gen = await generateMeetingLink('google-meet', {
          title: role != null ? role : interview.title,
          startTime: newStart,
          endTime: newEnd,
          candidateEmail: candidateEmail != null ? candidateEmail.toLowerCase() : interview.candidateEmail,
          interviewerEmail: iEmail,
          organizerUserId: req.user._id,
        });
        meetingResult = { meetingLink: gen.meetingLink, meetingId: gen.meetingId || interview.meetingId };
      } catch (err) {
        return res.status(400).json({ success: false, message: err.message || 'Could not refresh Google Meet link' });
      }
    }

    if (candidateEmail != null) interview.candidateEmail = candidateEmail.toLowerCase().trim();
    if (candidateName != null) interview.candidateName = candidateName;
    if (interviewerEmail != null) interview.interviewerEmail = interviewerEmail.toLowerCase().trim();
    if (interviewerName != null) interview.interviewerName = interviewerName;
    if (role != null) {
      interview.title = role;
      interview.role = role;
    }
    if (interviewType != null) interview.interviewType = interviewType;
    interview.duration = newDuration;
    interview.scheduledAt = newStart;
    interview.endTime = newEnd;
    if (timezone != null) interview.timezone = timezone;
    if (notes !== undefined) interview.notes = notes;
    if (meetingPlatform != null) interview.meetingPlatform = meetingPlatform;
    interview.meetingLink = meetingResult.meetingLink;
    if (meetingResult.meetingId) interview.meetingId = meetingResult.meetingId;

    await interview.save();
    res.json({ success: true, message: 'Interview updated.', data: { interview } });
  } catch (err) { next(err); }
};

module.exports = {
  scheduleInterview, getInterviews, getInterview,
  cancelInterview, rescheduleInterview, confirmAttendance,
  getInterviewByFeedbackToken, updateMeetingLink, getUpcomingInterviews, updateInterview,
};
