const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { mongoIdValidation } = require('../middleware/validation');
const {
  createCompany,
  getMyWorkspace,
  updateCompany,
  updateSpaceCode,
  getCompanies,
  getCompany,
  deleteCompany,
} = require('../controllers/companyController');

router.use(authenticate);

router.get('/workspace', authorize('admin', 'hr'), getMyWorkspace);
router.post('/', authorize('admin'), createCompany);
router.get('/', authorize('admin'), getCompanies);
router.patch('/:id/space-code', authorize('admin'), mongoIdValidation(), updateSpaceCode);
router.patch('/:id', authorize('admin'), mongoIdValidation(), updateCompany);
router.get('/:id', authorize('admin'), mongoIdValidation(), getCompany);
router.delete('/:id', authorize('admin'), mongoIdValidation(), deleteCompany);

module.exports = router;
