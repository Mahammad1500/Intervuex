const { v4: uuidv4 } = require('uuid');
const { format, addMinutes, parseISO, isValid } = require('date-fns');

const generateUUID = () => uuidv4();

const formatDateTime = (date, fmt = 'PPpp') => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, fmt) : 'Invalid date';
};

const calculateEndTime = (startTime, durationMinutes) => {
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  return addMinutes(start, durationMinutes);
};

const paginate = (query, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

const buildPaginationMeta = (total, page, limit) => ({
  total,
  page: parseInt(page),
  limit: parseInt(limit),
  pages: Math.ceil(total / limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1,
});

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.__v;
  return obj;
};

const generateMeetingId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segment = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment(3)}-${segment(4)}-${segment(3)}`;
};

const INTERVIEW_TYPES = ['technical', 'behavioral', 'system-design', 'hr', 'final', 'screening'];
const INTERVIEW_STATUS = ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no-show'];
const USER_ROLES = ['admin', 'hr'];

module.exports = {
  generateUUID,
  formatDateTime,
  calculateEndTime,
  paginate,
  buildPaginationMeta,
  sanitizeUser,
  generateMeetingId,
  INTERVIEW_TYPES,
  INTERVIEW_STATUS,
  USER_ROLES,
};
