const { body, param, query, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('role').optional().isIn(['admin', 'hr']).withMessage('Invalid role'),
  body('spaceCode').trim().notEmpty().withMessage('Space code is required for HR registration'),
  handleValidation,
];

const createUserValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('role').isIn(['admin', 'hr']).withMessage('Role must be admin or hr'),
  body('companyId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid company workspace'),
  body('department').optional().isString().trim().isLength({ max: 100 }),
  body('jobTitle').optional().isString().trim().isLength({ max: 100 }),
  body('phone').optional().isString().trim().isLength({ max: 30 }),
  handleValidation,
];

const adminUpdateUserValidation = [
  body('firstName').optional().trim().notEmpty().isLength({ max: 50 }),
  body('lastName').optional().trim().notEmpty().isLength({ max: 50 }),
  body('role').optional().isIn(['admin', 'hr']),
  body('companyId').optional({ nullable: true, checkFalsy: true }).isMongoId(),
  body('department').optional().isString().trim().isLength({ max: 100 }),
  body('jobTitle').optional().isString().trim().isLength({ max: 100 }),
  body('phone').optional().isString().trim().isLength({ max: 30 }),
  handleValidation,
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const scheduleInterviewValidation = [
  body('candidateEmail').isEmail().withMessage('Valid candidate email is required').normalizeEmail(),
  body('candidateName').optional().isString().trim(),
  body('interviewerEmail').isEmail().withMessage('Valid interviewer email is required').normalizeEmail(),
  body('interviewerName').optional().isString().trim(),
  body('role').trim().notEmpty().withMessage('Role is required')
    .isLength({ min: 3 }).withMessage('Role must be at least 3 characters')
    .matches(/^[a-zA-Z0-9\s\/\-]+$/).withMessage('Role must contain only letters, numbers, spaces, slashes, or hyphens'),
  body('interviewType').isIn(['technical', 'behavioral', 'system-design', 'hr', 'final', 'screening']).withMessage('Invalid interview type'),
  body('duration').isInt({ min: 15, max: 240 }).withMessage('Duration must be between 15 and 240 minutes'),
  body('scheduledAt')
    .notEmpty().withMessage('Date and time are required')
    .custom((value) => {
      const t = new Date(value);
      if (Number.isNaN(t.getTime())) throw new Error('Valid date/time is required');
      const minTime = new Date(Date.now() + 30 * 60 * 1000);
      if (t < minTime) {
        throw new Error('Interview must be scheduled at least 30 minutes from now');
      }
      return true;
    }),
  body('meetingPlatform').optional().isIn(['google-meet', 'manual']).withMessage('Platform must be google-meet or manual'),
  body('meetingLink').optional().custom((v) => {
    if (v == null || v === '') return true;
    try {
      // eslint-disable-next-line no-new
      new URL(String(v).trim());
      return true;
    } catch {
      throw new Error('Meeting link must be a valid URL (include https://)');
    }
  }),
  body('timezone').optional().isString().custom((value) => {
    if (value) {
      try { Intl.DateTimeFormat(undefined, { timeZone: value }); } catch (e) { throw new Error('Invalid timezone'); }
    }
    return true;
  }),
  body('notes').optional().isString(),
  body('panelists').optional().isArray().withMessage('Panelists must be an array'),
  body('panelists.*.email').optional().isEmail().withMessage('Each panelist needs a valid email').normalizeEmail(),
  body('panelists.*.name').optional().isString().trim(),
  // Empty string from HTML selects must be treated as "missing" (not invalid MongoId)
  body('companyId').optional({ checkFalsy: true }).isMongoId().withMessage('Valid company workspace is required for admin'),
  handleValidation,
];

const feedbackValidation = [
  body('overallRating').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be 1-5'),
  body('recommendation').isIn(['strong-hire', 'hire', 'neutral', 'no-hire', 'strong-no-hire']).withMessage('Invalid recommendation'),
  body('ratings.technicalSkills').optional().isInt({ min: 1, max: 5 }),
  body('ratings.communication').optional().isInt({ min: 1, max: 5 }),
  body('ratings.problemSolving').optional().isInt({ min: 1, max: 5 }),
  body('ratings.cultureFit').optional().isInt({ min: 1, max: 5 }),
  body('ratings.experience').optional().isInt({ min: 1, max: 5 }),
  handleValidation,
];

const updateInterviewValidation = [
  body('candidateEmail').optional().isEmail().withMessage('Valid candidate email is required').normalizeEmail(),
  body('candidateName').optional().isString().trim(),
  body('interviewerEmail').optional().isEmail().withMessage('Valid interviewer email is required').normalizeEmail(),
  body('interviewerName').optional().isString().trim(),
  body('role').optional().isString().trim()
    .isLength({ min: 3 }).withMessage('Role must be at least 3 characters')
    .matches(/^[a-zA-Z0-9\s\/\-]+$/).withMessage('Invalid role format'),
  body('interviewType').optional().isIn(['technical', 'behavioral', 'system-design', 'hr', 'final', 'screening']),
  body('duration').optional({ checkFalsy: true }).isInt({ min: 15, max: 240 }),
  body('scheduledAt').optional()
    .custom((value) => {
      if (value == null) return true;
      const t = new Date(value);
      if (Number.isNaN(t.getTime())) throw new Error('Valid date/time is required');
      const minTime = new Date(Date.now() + 15 * 60 * 1000);
      if (t < minTime) throw new Error('Interview must be at least 15 minutes from now');
      return true;
    }),
  body('meetingPlatform').optional().isIn(['google-meet', 'manual']),
  body('meetingLink').optional().custom((v) => {
    if (v == null || v === '') return true;
    try { new URL(String(v).trim()); return true; } catch {
      throw new Error('Meeting link must be a valid URL');
    }
  }),
  body('timezone').optional().isString(),
  body('notes').optional().isString(),
  handleValidation,
];

const mongoIdValidation = (field = 'id') => [
  param(field).isMongoId().withMessage(`Invalid ${field}`),
  handleValidation,
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  handleValidation,
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  handleValidation,
];

const googleCompleteValidation = [
  body('signupToken').notEmpty().withMessage('Signup session expired'),
  body('spaceCode').trim().notEmpty().withMessage('Space code is required'),
  handleValidation,
];

module.exports = {
  handleValidation,
  registerValidation,
  loginValidation,
  createUserValidation,
  adminUpdateUserValidation,
  scheduleInterviewValidation,
  updateInterviewValidation,
  feedbackValidation,
  mongoIdValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  googleCompleteValidation,
};
