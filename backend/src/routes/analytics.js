const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { getDashboardStats, getInterviewTrends, getHiringFunnel, getInterviewerPerformance, getFeedbackStats } = require('../controllers/analyticsController');

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/trends', getInterviewTrends);
router.get('/funnel', authorize('admin', 'hr'), getHiringFunnel);
router.get('/interviewer-performance', authorize('admin', 'hr', 'interviewer'), getInterviewerPerformance);
router.get('/feedback', getFeedbackStats);

module.exports = router;
