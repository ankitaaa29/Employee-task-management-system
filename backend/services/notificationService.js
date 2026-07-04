const db = require('../config/db');
const Notification = require('../models/Notification');

const checkUpcomingDueTasks = async () => {
  try {
    // Find tasks that are due within 24 hours and haven't had a due warning notification generated
    const [tasks] = await db.query(`
      SELECT t.id, t.title, t.assigned_to, t.due_date 
      FROM tasks t
      WHERE t.status != 'Completed'
        AND t.assigned_to IS NOT NULL
        AND t.due_date <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        AND t.due_date >= CURDATE()
        AND NOT EXISTS (
          SELECT 1 FROM notifications n 
          WHERE n.task_id = t.id 
            AND n.type = 'Task_Due_Warning'
        )
    `);

    for (const task of tasks) {
      await Notification.create({
        user_id: task.assigned_to,
        message: `Warning: The task "${task.title}" is due within 24 hours (Due: ${task.due_date})`,
        type: 'Task_Due_Warning',
        task_id: task.id
      });
      console.log(`Generated due warning notification for task ID ${task.id} (user ID ${task.assigned_to})`);
    }
  } catch (error) {
    console.error('Error checking upcoming due tasks:', error.message);
  }
};

const startNotificationService = () => {
  // Run once immediately on startup
  checkUpcomingDueTasks();

  // Run every 1 hour (3600000 ms)
  setInterval(checkUpcomingDueTasks, 60 * 60 * 1000);
};

module.exports = {
  checkUpcomingDueTasks,
  startNotificationService
};
