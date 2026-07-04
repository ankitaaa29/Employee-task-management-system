import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../redux/employeeSlice';
import Table from '../components/Common/Table';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';
import Toast from '../components/Common/Toast';

const EmployeeManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, pagination, loading } = useSelector((state: RootState) => state.employees);

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', department: '', designation: '' });
  const [formError, setFormError] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'warning' } | null>(null);

  const loadEmployees = useCallback(() => {
    dispatch(fetchEmployees({ page, limit: 10, search, sortField, sortOrder }));
  }, [dispatch, page, search, sortField, sortOrder]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadEmployees();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortOrder('ASC');
    }
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({ name: '', email: '', department: '', designation: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (emp: any) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      department: emp.department || '',
      designation: emp.designation || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || !formData.department || !formData.designation) {
      setFormError('All fields are required');
      return;
    }

    try {
      if (editingEmployee) {
        const result = await dispatch(updateEmployee({ id: editingEmployee.id, employeeData: formData }));
        if (updateEmployee.fulfilled.match(result)) {
          setToast({ message: 'Employee updated successfully', type: 'success' });
          setShowModal(false);
          loadEmployees();
        } else {
          setFormError((result.payload as string) || 'Update failed');
        }
      } else {
        const result = await dispatch(createEmployee(formData));
        if (createEmployee.fulfilled.match(result)) {
          setToast({ message: 'Employee created successfully', type: 'success' });
          setShowModal(false);
          loadEmployees();
        } else {
          setFormError((result.payload as string) || 'Creation failed');
        }
      }
    } catch {
      setFormError('An unexpected error occurred');
    }
  };

  const confirmDelete = (emp: any) => {
    setDeleteTarget(emp);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteEmployee(deleteTarget.id));
    if (deleteEmployee.fulfilled.match(result)) {
      setToast({ message: 'Employee deleted successfully', type: 'success' });
      loadEmployees();
    } else {
      setToast({ message: (result.payload as string) || 'Delete failed', type: 'danger' });
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'designation', label: 'Designation', sortable: true },
    { key: 'actions', label: 'Actions' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Employee Management</h1>
        <Button onClick={openCreateModal} icon="➕">Add Employee</Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            placeholder="Search by name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={employees}
        loading={loading}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No employees found. Click 'Add Employee' to create one."
        renderRow={(emp: any) => (
          <tr key={emp.id}>
            <td><strong>{emp.name}</strong></td>
            <td>{emp.email}</td>
            <td>{emp.department || '—'}</td>
            <td>{emp.designation || '—'}</td>
            <td>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm" onClick={() => openEditModal(emp)}>✏️ Edit</Button>
                <Button variant="danger" size="sm" onClick={() => confirmDelete(emp)}>🗑️ Delete</Button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}
          </span>
          <div className="pagination-buttons">
            <Button
              variant="secondary" size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ← Previous
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).slice(
              Math.max(0, page - 3), Math.min(pagination.totalPages, page + 2)
            ).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="secondary" size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleFormSubmit} loading={loading}>
              {editingEmployee ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        {formError && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            color: 'var(--danger-color)',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            fontWeight: 500
          }}>
            ⚠️ {formError}
          </div>
        )}
        <form onSubmit={handleFormSubmit}>
          <Input
            id="emp-name" label="Name" placeholder="Full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            id="emp-email" label="Email" type="email" placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            id="emp-dept" label="Department" placeholder="e.g. Engineering"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            required
          />
          <Input
            id="emp-desig" label="Designation" placeholder="e.g. Senior Developer"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            required
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        title="Confirm Delete"
        onClose={() => setShowDeleteConfirm(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={loading}>Delete</Button>
          </>
        }
      >
        <p>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          This action cannot be undone. All tasks assigned to this employee will be unassigned.
        </p>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
