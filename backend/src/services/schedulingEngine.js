const Interview = require('../models/Interview');
const { addMinutes, addDays, setHours, setMinutes } = require('date-fns');

const BUSINESS_HOURS = { start: 9, end: 18 };
const SLOT_INCREMENT_MINUTES = 30;

const activeOverlapQuery = (email, startTime, endTime, excludeInterviewId = null) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const emailLower = email.toLowerCase();
  const base = {
    status: { $in: ['scheduled', 'confirmed'] },
    scheduledAt: { $lt: end },
    endTime: { $gt: start },
  };
  if (excludeInterviewId) base._id = { $ne: excludeInterviewId };

  return {
    ...base,
    $or: [
      { interviewerEmail: emailLower },
      { panelists: { $elemMatch: { email: emailLower } } },
    ],
  };
};

const checkConflicts = async (interviewerEmail, startTime, endTime, excludeInterviewId = null) => {
  const conflicting = await Interview.findOne(
    activeOverlapQuery(interviewerEmail, startTime, endTime, excludeInterviewId),
  );

  if (conflicting) {
    return {
      hasConflict: true,
      details: {
        conflictingInterview: conflicting._id,
        scheduledAt: conflicting.scheduledAt,
        endTime: conflicting.endTime,
        candidateEmail: conflicting.candidateEmail,
        email: interviewerEmail.toLowerCase(),
      },
    };
  }

  return { hasConflict: false, details: null };
};

const checkPanelConflicts = async (emails, startTime, endTime, excludeInterviewId = null) => {
  const unique = [...new Set(emails.map((e) => e.toLowerCase().trim()).filter(Boolean))];
  for (const email of unique) {
    const result = await checkConflicts(email, startTime, endTime, excludeInterviewId);
    if (result.hasConflict) return result;
  }
  return { hasConflict: false, details: null };
};

const suggestAlternativeSlots = async (interviewerEmail, preferredStart, durationMinutes, count = 5) => {
  const slots = [];
  let date = new Date(preferredStart);
  const maxDays = 7;
  let daysChecked = 0;

  while (slots.length < count && daysChecked < maxDays) {
    const dayStart = setHours(setMinutes(new Date(date), 0), BUSINESS_HOURS.start);
    const dayEnd = setHours(setMinutes(new Date(date), 0), BUSINESS_HOURS.end);

    let slotStart = daysChecked === 0 ? new Date(preferredStart) : dayStart;

    while (slotStart < dayEnd && slots.length < count) {
      const slotEnd = addMinutes(slotStart, durationMinutes);
      if (slotEnd <= dayEnd) {
        const { hasConflict } = await checkConflicts(interviewerEmail, slotStart, slotEnd);
        if (!hasConflict) {
          slots.push({ startTime: new Date(slotStart), endTime: new Date(slotEnd) });
        }
      }
      slotStart = addMinutes(slotStart, SLOT_INCREMENT_MINUTES);
    }

    date = addDays(date, 1);
    daysChecked++;
  }

  return slots;
};

const schedulingEngine = { checkConflicts, checkPanelConflicts, suggestAlternativeSlots };

module.exports = { schedulingEngine };
