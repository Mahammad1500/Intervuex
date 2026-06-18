const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { getAuditLogs } = require('../controllers/auditController');

router.get('/', authenticate, authorize('admin'), getAuditLogs);

module.exports = router;
