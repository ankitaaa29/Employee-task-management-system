const express = require('express');
const router = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask, getDashboardStats } = require('../controllers/taskController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { taskValidation } = require('../utils/validators');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/', getTasks);
router.get('/:id', getTaskById);

// Admin-only creation & deletion
router.post('/', authorizeRoles('Admin'), upload.single('attachment'), taskValidation, createTask);
router.delete('/:id', authorizeRoles('Admin'), deleteTask);

// Admin can update all fields; Employee can only update status
router.put('/:id', upload.single('attachment'), (req, res, next) => {
  // If user is Admin, run task validation (optional fields during update can be tricky, but we can do validation or pass to controller)
  // Let's let the controller validate or let express-validator run if it's admin.
  // Actually, since employees only update status, they don't upload attachments, but admins might.
  // We can let the controller handle validation or use a custom validator. To be safe, let's run validator only if Admin is modifying text fields,
  // or handle validation in controller, or just run taskValidation.
  // Let's run taskValidation if the user is Admin.
  if (req.user.role === 'Admin') {
    return taskValidation(req, res, next);
  }
  next();
}, updateTask);

module.exports = router;
