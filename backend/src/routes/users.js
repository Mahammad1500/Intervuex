const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { mongoIdValidation } = require('../middleware/validation');
const { getUsers, getUser, createUser, updateUser, toggleUserStatus } = require('../controllers/userController');

router.use(authenticate);

router.get('/', authorize('admin', 'hr'), getUsers);
router.post('/', authorize('admin'), createUser);
router.get('/:id', mongoIdValidation(), getUser);
router.put('/:id', mongoIdValidation(), updateUser);
router.patch('/:id/toggle-status', authorize('admin'), mongoIdValidation(), toggleUserStatus);

module.exports = router;
