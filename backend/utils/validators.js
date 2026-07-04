const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map(err => err.msg).join(', ');
    return res.status(400).json({ success: false, message: errorMsg, errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Full Name is required'),
  body('email').trim().isEmail().withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  body('role').isIn(['Admin', 'Employee']).withMessage('Role must be either Admin or Employee'),
  validate
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const employeeValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please enter a valid email address'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  validate
];

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('start_date').isDate().withMessage('Valid start date is required'),
  body('due_date').isDate().withMessage('Valid due date is required')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.start_date)) {
        throw new Error('Due date cannot be earlier than start date');
      }
      return true;
    }),
  body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority value'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status value'),
  body('assigned_to').optional({ nullable: true }).isInt().withMessage('Assigned employee ID must be an integer'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  employeeValidation,
  taskValidation
};
