const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { scheduleInterviewValidation, updateInterviewValidation, mongoIdValidation } = require('../middleware/validation');
const { schedulingLimiter } = require('../middleware/rateLimiter');
const {
  scheduleInterview, getInterviews, getInterview,
  cancelInterview, rescheduleInterview, confirmAttendance,
  getInterviewByFeedbackToken, updateMeetingLink, getUpcomingInterviews, updateInterview,
} = require('../controllers/interviewController');

// Public routes (no auth required — magic link access)
router.get('/confirm/:token', confirmAttendance);
router.get('/feedback-form/:token', getInterviewByFeedbackToken);

// All routes below require authentication
router.use(authenticate);

router.post('/', authorize('admin', 'hr'), schedulingLimiter, scheduleInterviewValidation, scheduleInterview);
router.get('/', getInterviews);
router.get('/upcoming', getUpcomingInterviews);
router.get('/:id', mongoIdValidation(), getInterview);
router.patch('/:id', authorize('admin', 'hr'), mongoIdValidation(), updateInterviewValidation, updateInterview);
router.patch('/:id/cancel', authorize('admin', 'hr'), cancelInterview);
router.post('/:id/reschedule', authorize('admin', 'hr'), rescheduleInterview);
router.patch('/:id/meeting-link', authenticate, updateMeetingLink);

module.exports = router;
