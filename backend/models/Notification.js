const db = require('../config/db');

const Notification = {
  async create({ user_id, message, type, task_id }) {
    const [result] = await db.query(
      'INSERT INTO notifications (user_id, message, type, task_id) VALUES (?, ?, ?, ?)',
      [user_id, message, type, task_id || null]
    );
    return result.insertId;
  },

  async findByUserId(userId) {
    const [rows] = await db.query(
      `SELECT n.*, t.title as task_title 
       FROM notifications n 
       LEFT JOIN tasks t ON n.task_id = t.id 
       WHERE n.user_id = ? 
       ORDER BY n.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async countUnread(userId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return rows[0].count;
  },

  async markAsRead(id, userId) {
    const [result] = await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  async markAllAsRead(userId) {
    const [result] = await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM notifications WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Notification;
