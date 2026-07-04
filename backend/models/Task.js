const db = require('../config/db');

const Task = {
  async findById(id) {
    const [rows] = await db.query(
      `SELECT t.*, u.name as assigned_name, u.email as assigned_email 
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.id = ?`,
      [id]
    );
    return rows[0];
  },

  async create({ title, description, priority, status, start_date, due_date, assigned_to, attachment_path }) {
    const [result] = await db.query(
      `INSERT INTO tasks (title, description, priority, status, start_date, due_date, assigned_to, attachment_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, priority || 'Medium', status || 'Pending', start_date, due_date, assigned_to || null, attachment_path || null]
    );
    return result.insertId;
  },

  async update(id, { title, description, priority, status, start_date, due_date, assigned_to, attachment_path }) {
    const [result] = await db.query(
      `UPDATE tasks 
       SET title = ?, description = ?, priority = ?, status = ?, start_date = ?, due_date = ?, assigned_to = ?, attachment_path = ? 
       WHERE id = ?`,
      [title, description || null, priority, status, start_date, due_date, assigned_to || null, attachment_path || null, id]
    );
    return result.affectedRows > 0;
  },

  async updateStatus(id, status) {
    const [result] = await db.query(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async findAll({ search = '', priority = '', status = '', assigned_to = '', sortField = 'created_at', sortOrder = 'DESC', limit = 10, offset = 0 }) {
    let query = `
      SELECT t.*, u.name as assigned_name, u.email as assigned_email 
      FROM tasks t 
      LEFT JOIN users u ON t.assigned_to = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild);
    }

    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (assigned_to) {
      query += ' AND t.assigned_to = ?';
      params.push(assigned_to);
    }

    const allowedSortFields = ['title', 'priority', 'status', 'start_date', 'due_date', 'created_at'];
    const activeSortField = allowedSortFields.includes(sortField) ? `t.${sortField}` : 't.created_at';
    const activeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${activeSortField} ${activeSortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows;
  },

  async countAll({ search = '', priority = '', status = '', assigned_to = '' }) {
    let query = `
      SELECT COUNT(*) as count 
      FROM tasks t 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild);
    }

    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (assigned_to) {
      query += ' AND t.assigned_to = ?';
      params.push(assigned_to);
    }

    const [rows] = await db.query(query, params);
    return rows[0].count;
  },

  async getAdminDashboardStats() {
    const [totalEmployees] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "Employee"');
    const [taskStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status != 'Completed' THEN 1 ELSE 0 END) as pending
      FROM tasks
    `);
    
    return {
      totalEmployees: totalEmployees[0].count,
      totalTasks: taskStats[0].total || 0,
      completedTasks: taskStats[0].completed || 0,
      pendingTasks: taskStats[0].pending || 0
    };
  },

  async getEmployeeDashboardStats(employeeId) {
    const [taskStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status != 'Completed' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status != 'Completed' AND due_date < CURDATE() THEN 1 ELSE 0 END) as overdue
      FROM tasks
      WHERE assigned_to = ?
    `, [employeeId]);

    return {
      totalTasks: taskStats[0].total || 0,
      completedTasks: taskStats[0].completed || 0,
      pendingTasks: taskStats[0].pending || 0,
      overdueTasks: taskStats[0].overdue || 0
    };
  },

  async getMonthlyTaskTrends() {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%b %Y') as month,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
      FROM tasks
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), month
      ORDER BY MIN(created_at) ASC
      LIMIT 6
    `);
    return rows;
  },

  async getPriorityDistribution() {
    const [rows] = await db.query(`
      SELECT priority, COUNT(*) as count 
      FROM tasks 
      GROUP BY priority
    `);
    return rows;
  }
};

module.exports = Task;
