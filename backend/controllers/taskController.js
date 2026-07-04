const Task = require('../models/Task');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

const getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const priority = req.query.priority || '';
    const status = req.query.status || '';
    const sortField = req.query.sortField || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';
    const offset = (page - 1) * limit;

    let assigned_to = req.query.assigned_to || '';

    // Route guard: Employees can only view their own tasks
    if (req.user.role === 'Employee') {
      assigned_to = req.user.id.toString();
    }

    const tasks = await Task.findAll({
      search,
      priority,
      status,
      assigned_to,
      sortField,
      sortOrder,
      limit,
      offset
    });

    const total = await Task.countAll({
      search,
      priority,
      status,
      assigned_to
    });

    res.status(200).json({
      success: true,
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Route guard: Employee can only view their own tasks
    if (req.user.role === 'Employee' && task.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own tasks' });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  const { title, description, priority, start_date, due_date, assigned_to } = req.body;
  const attachment_path = req.file ? `uploads/${req.file.filename}` : null;

  try {
    const taskId = await Task.create({
      title,
      description,
      priority,
      status: 'Pending',
      start_date,
      due_date,
      assigned_to,
      attachment_path
    });

    // Create notification if assigned
    if (assigned_to) {
      await Notification.create({
        user_id: assigned_to,
        message: `You have been assigned a new task: "${title}"`,
        type: 'Task_Assigned',
        task_id: taskId
      });
    }

    const task = await Task.findById(taskId);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    // If error occurs, delete the uploaded file
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  const { id } = req.params;
  
  try {
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Business Rule: Completed tasks cannot be edited
    if (existingTask.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Completed tasks cannot be edited' });
    }

    // If logged-in user is an Employee
    if (req.user.role === 'Employee') {
      // Employees can only edit their own tasks
      if (existingTask.assigned_to !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied: You can only update your assigned tasks' });
      }

      // Employees can ONLY update task status
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }

      if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }

      await Task.updateStatus(id, status);

      // Create notification if completed
      if (status === 'Completed') {
        await Notification.create({
          user_id: existingTask.assigned_to,
          message: `You completed the task: "${existingTask.title}"`,
          type: 'Task_Completed',
          task_id: id
        });
      }

      const updatedTask = await Task.findById(id);
      return res.status(200).json({
        success: true,
        message: 'Task status updated successfully',
        task: updatedTask
      });
    }

    // If user is Admin, they can update everything
    const { title, description, priority, status, start_date, due_date, assigned_to } = req.body;
    let attachment_path = existingTask.attachment_path;

    if (req.file) {
      // Delete old attachment if exists
      if (existingTask.attachment_path) {
        const oldPath = path.join(__dirname, '..', existingTask.attachment_path);
        fs.unlink(oldPath, () => {});
      }
      attachment_path = `uploads/${req.file.filename}`;
    }

    await Task.update(id, {
      title: title || existingTask.title,
      description: description !== undefined ? description : existingTask.description,
      priority: priority || existingTask.priority,
      status: status || existingTask.status,
      start_date: start_date || existingTask.start_date,
      due_date: due_date || existingTask.due_date,
      assigned_to: assigned_to !== undefined ? assigned_to : existingTask.assigned_to,
      attachment_path
    });

    // Create notifications for assignments / status updates
    if (assigned_to && Number(assigned_to) !== existingTask.assigned_to) {
      await Notification.create({
        user_id: assigned_to,
        message: `You have been assigned a task: "${title || existingTask.title}"`,
        type: 'Task_Assigned',
        task_id: id
      });
    }

    if (status === 'Completed' && existingTask.status !== 'Completed') {
      const activeAssignee = assigned_to || existingTask.assigned_to;
      if (activeAssignee) {
        await Notification.create({
          user_id: activeAssignee,
          message: `Task completed: "${title || existingTask.title}"`,
          type: 'Task_Completed',
          task_id: id
        });
      }
    }

    const updatedTask = await Task.findById(id);
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Delete attachment file
    if (task.attachment_path) {
      const filePath = path.join(__dirname, '..', task.attachment_path);
      fs.unlink(filePath, () => {});
    }

    await Task.delete(id);
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    if (req.user.role === 'Admin') {
      const stats = await Task.getAdminDashboardStats();
      const priorityDist = await Task.getPriorityDistribution();
      const monthlyTrends = await Task.getMonthlyTaskTrends();
      return res.status(200).json({
        success: true,
        stats,
        charts: {
          priorityDistribution: priorityDist,
          monthlyTrends: monthlyTrends
        }
      });
    } else {
      const stats = await Task.getEmployeeDashboardStats(req.user.id);
      return res.status(200).json({ success: true, stats });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats
};
