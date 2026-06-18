const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const {
  getGoogleAuthUrl, handleGoogleCallback,
  disconnectCalendar, getCalendarStatus,
} = require('../controllers/calendarController');

router.get('/google/auth-url', authenticate, getGoogleAuthUrl);
router.get('/google/callback', handleGoogleCallback);
router.delete('/disconnect/:provider', authenticate, disconnectCalendar);
router.get('/status', authenticate, getCalendarStatus);

module.exports = router;
