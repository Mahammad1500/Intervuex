const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { feedbackValidation, mongoIdValidation } = require('../middleware/validation');
const { submitFeedback, getFeedback, getMyFeedbacks, updateFeedback } = require('../controllers/feedbackController');

router.use(authenticate);

router.post('/interview/:interviewId', authorize('admin', 'interviewer'), feedbackValidation, submitFeedback);
router.get('/interview/:interviewId', getFeedback);
router.get('/mine', getMyFeedbacks);
router.put('/:id', mongoIdValidation(), authorize('admin', 'interviewer'), updateFeedback);

module.exports = router;
