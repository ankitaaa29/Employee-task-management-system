const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { employeeValidation } = require('../utils/validators');

// Protect all routes and allow only Admin access
router.use(protect);
router.use(authorizeRoles('Admin'));

router.get('/', getEmployees);
router.post('/', employeeValidation, createEmployee);
router.put('/:id', employeeValidation, updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;
