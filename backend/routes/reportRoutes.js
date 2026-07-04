const express = require('express');
const router = express.Router();
const { getCompletedTasksReport, getPendingTasksReport, getEmployeeWiseReport, exportCSV, exportExcel } = require('../controllers/reportController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(authorizeRoles('Admin'));

router.get('/completed', getCompletedTasksReport);
router.get('/pending', getPendingTasksReport);
router.get('/employee-wise', getEmployeeWiseReport);
router.get('/export/csv', exportCSV);
router.get('/export/excel', exportExcel);

module.exports = router;
