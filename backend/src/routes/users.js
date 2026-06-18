const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { mongoIdValidation, createUserValidation, adminUpdateUserValidation } = require('../middleware/validation');
const { getUsers, getUser, createUser, updateUser, toggleUserStatus, resendWelcomeEmail, deleteUser } = require('../controllers/userController');

router.use(authenticate);

router.get('/', authorize('admin'), getUsers);
router.post('/', authorize('admin'), createUserValidation, createUser);
router.get('/:id', mongoIdValidation(), getUser);
router.put('/:id', mongoIdValidation(), adminUpdateUserValidation, updateUser);
router.patch('/:id/toggle-status', authorize('admin'), mongoIdValidation(), toggleUserStatus);
router.post('/:id/resend-welcome', authorize('admin'), mongoIdValidation(), resendWelcomeEmail);
router.delete('/:id', authorize('admin'), mongoIdValidation(), deleteUser);

module.exports = router;
