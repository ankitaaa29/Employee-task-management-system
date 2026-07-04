const db = require('../config/db');

const User = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.query('SELECT id, name, email, role, department, designation, created_at, updated_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async findByIdWithPassword(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ name, email, password, role, department, designation }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, department, designation) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, role || 'Employee', department || null, designation || null]
    );
    return result.insertId;
  },

  async update(id, { name, email, department, designation, role }) {
    const [result] = await db.query(
      'UPDATE users SET name = ?, email = ?, department = ?, designation = ?, role = ? WHERE id = ?',
      [name, email, department || null, designation || null, role, id]
    );
    return result.affectedRows > 0;
  },

  async updatePassword(id, hashedPassword) {
    const [result] = await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async findAllEmployees({ search = '', sortField = 'name', sortOrder = 'ASC', limit = 10, offset = 0 }) {
    let query = 'SELECT id, name, email, role, department, designation, created_at FROM users WHERE role = "Employee"';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR department LIKE ? OR designation LIKE ?)';
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild, searchWild);
    }

    const allowedSortFields = ['name', 'email', 'department', 'designation', 'created_at'];
    const activeSortField = allowedSortFields.includes(sortField) ? sortField : 'name';
    const activeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${activeSortField} ${activeSortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows;
  },

  async countEmployees({ search = '' }) {
    let query = 'SELECT COUNT(*) as count FROM users WHERE role = "Employee"';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR department LIKE ? OR designation LIKE ?)';
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild, searchWild);
    }

    const [rows] = await db.query(query, params);
    return rows[0].count;
  },

  async findAllEmployeesNoPagination() {
    const [rows] = await db.query('SELECT id, name, email, department, designation FROM users WHERE role = "Employee" ORDER BY name ASC');
    return rows;
  }
};

module.exports = User;
