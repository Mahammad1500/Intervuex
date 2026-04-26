const Interview = require('../models/Interview');
const { addMinutes, addDays, setHours, setMinutes } = require('date-fns');
const logger = require('../utils/logger');

const BUSINESS_HOURS = { start: 9, end: 18 };
const SLOT_INCREMENT_MINUTES = 30;

const checkConflicts = async (interviewerEmail, startTime, endTime, excludeInterviewId = null) => {
  const query = {
    interviewerEmail: interviewerEmail.toLowerCase(),
    status: { $in: ['scheduled', 'confirmed'] },
    scheduledAt: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  };
  if (excludeInterviewId) query._id = { $ne: excludeInterviewId };

  const conflicting = await Interview.findOne(query);

  if (conflicting) {
    return {
      hasConflict: true,
      details: {
        conflictingInterview: conflicting._id,
        scheduledAt: conflicting.scheduledAt,
        endTime: conflicting.endTime,
        candidateEmail: conflicting.candidateEmail,
      },
    };
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

const schedulingEngine = { checkConflicts, suggestAlternativeSlots };

module.exports = { schedulingEngine };
