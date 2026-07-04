const ReportService = require('../services/reportService');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

const getCompletedTasksReport = async (req, res, next) => {
  try {
    const data = await ReportService.getCompletedTasks();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getPendingTasksReport = async (req, res, next) => {
  try {
    const data = await ReportService.getPendingTasks();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getEmployeeWiseReport = async (req, res, next) => {
  try {
    const data = await ReportService.getEmployeeWiseTasks();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getReportData = async (type) => {
  if (type === 'completed') {
    const raw = await ReportService.getCompletedTasks();
    return {
      data: raw.map(item => ({
        'Task ID': item.id,
        'Title': item.title,
        'Priority': item.priority,
        'Status': item.status,
        'Start Date': item.start_date,
        'Due Date': item.due_date,
        'Assigned Employee': item.assigned_name || 'Unassigned',
        'Employee Email': item.assigned_email || '-',
        'Department': item.department || '-'
      })),
      fields: ['Task ID', 'Title', 'Priority', 'Status', 'Start Date', 'Due Date', 'Assigned Employee', 'Employee Email', 'Department']
    };
  } else if (type === 'pending') {
    const raw = await ReportService.getPendingTasks();
    return {
      data: raw.map(item => ({
        'Task ID': item.id,
        'Title': item.title,
        'Priority': item.priority,
        'Status': item.status,
        'Start Date': item.start_date,
        'Due Date': item.due_date,
        'Assigned Employee': item.assigned_name || 'Unassigned',
        'Employee Email': item.assigned_email || '-',
        'Department': item.department || '-',
        'Overdue': item.is_overdue
      })),
      fields: ['Task ID', 'Title', 'Priority', 'Status', 'Start Date', 'Due Date', 'Assigned Employee', 'Employee Email', 'Department', 'Overdue']
    };
  } else {
    // employee-wise
    const raw = await ReportService.getEmployeeWiseTasks();
    return {
      data: raw.map(item => ({
        'Employee ID': item.employee_id,
        'Employee Name': item.employee_name,
        'Employee Email': item.employee_email,
        'Department': item.department || '-',
        'Designation': item.designation || '-',
        'Total Tasks': item.total_tasks,
        'Completed Tasks': item.completed_tasks,
        'Pending Tasks': item.pending_tasks,
        'Overdue Tasks': item.overdue_tasks
      })),
      fields: ['Employee ID', 'Employee Name', 'Employee Email', 'Department', 'Designation', 'Total Tasks', 'Completed Tasks', 'Pending Tasks', 'Overdue Tasks']
    };
  }
};

const exportCSV = async (req, res, next) => {
  const { type } = req.query; // 'completed', 'pending', 'employee-wise'
  
  if (!['completed', 'pending', 'employee-wise'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid report type for export' });
  }

  try {
    const { data, fields } = await getReportData(type);
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`${type}_tasks_report_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

const exportExcel = async (req, res, next) => {
  const { type } = req.query;

  if (!['completed', 'pending', 'employee-wise'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid report type for export' });
  }

  try {
    const { data, fields } = await getReportData(type);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${type.substring(0, 31)} Report`);

    // Define column headers
    worksheet.columns = fields.map(f => ({ header: f, key: f, width: 20 }));

    // Format headers (bold with light blue fill)
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A365D' } // dark slate blue
    };

    // Add data rows
    worksheet.addRows(data);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${type}_tasks_report_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompletedTasksReport,
  getPendingTasksReport,
  getEmployeeWiseReport,
  exportCSV,
  exportExcel
};
