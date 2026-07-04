const db = require('../config/db');

const ReportService = {
  async getCompletedTasks() {
    const [rows] = await db.query(`
      SELECT 
        t.id, t.title, t.description, t.priority, t.status, 
        t.start_date, t.due_date, t.attachment_path, t.created_at,
        u.name as assigned_name, u.email as assigned_email, u.department
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.status = 'Completed'
      ORDER BY t.due_date DESC
    `);
    return rows;
  },

  async getPendingTasks() {
    const [rows] = await db.query(`
      SELECT 
        t.id, t.title, t.description, t.priority, t.status, 
        t.start_date, t.due_date, t.attachment_path, t.created_at,
        u.name as assigned_name, u.email as assigned_email, u.department,
        CASE WHEN t.due_date < CURDATE() THEN 'Yes' ELSE 'No' END as is_overdue
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.status != 'Completed'
      ORDER BY t.due_date ASC
    `);
    return rows;
  },

  async getEmployeeWiseTasks() {
    const [rows] = await db.query(`
      SELECT 
        u.id as employee_id, 
        u.name as employee_name, 
        u.email as employee_email, 
        u.department, 
        u.designation,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN t.status != 'Completed' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN t.status != 'Completed' AND t.due_date < CURDATE() THEN 1 ELSE 0 END) as overdue_tasks
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_to
      WHERE u.role = 'Employee'
      GROUP BY u.id, u.name, u.email, u.department, u.designation
      ORDER BY u.name ASC
    `);
    return rows;
  }
};

module.exports = ReportService;
