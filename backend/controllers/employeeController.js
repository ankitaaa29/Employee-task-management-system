const User = require('../models/User');
const bcrypt = require('bcryptjs');

const getEmployees = async (req, res, next) => {
  const all = req.query.all === 'true';
  
  try {
    if (all) {
      const employees = await User.findAllEmployeesNoPagination();
      return res.status(200).json({ success: true, employees });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const sortField = req.query.sortField || 'name';
    const sortOrder = req.query.sortOrder || 'ASC';
    
    const offset = (page - 1) * limit;

    const employees = await User.findAllEmployees({
      search,
      sortField,
      sortOrder,
      limit,
      offset
    });

    const total = await User.countEmployees({ search });

    res.status(200).json({
      success: true,
      employees,
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

const createEmployee = async (req, res, next) => {
  const { name, email, department, designation, password } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // Default password if not provided
    const defaultPassword = password || 'Employee@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const employeeId = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Employee',
      department,
      designation
    });

    const employee = await User.findById(employeeId);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, department, designation } = req.body;

  try {
    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (employee.role !== 'Employee') {
      return res.status(400).json({ success: false, message: 'User is not an employee' });
    }

    // Check if email is updated and is already taken by another user
    if (email !== employee.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already taken' });
      }
    }

    const updated = await User.update(id, {
      name,
      email,
      department,
      designation,
      role: 'Employee'
    });

    if (!updated) {
      return res.status(400).json({ success: false, message: 'Failed to update employee details' });
    }

    const updatedEmployee = await User.findById(id);

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  const { id } = req.params;

  try {
    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (employee.role !== 'Employee') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin users via employee management' });
    }

    const deleted = await User.delete(id);
    if (!deleted) {
      return res.status(400).json({ success: false, message: 'Failed to delete employee' });
    }

    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
