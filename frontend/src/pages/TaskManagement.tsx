import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchTasks, createTask, updateTask, deleteTask } from '../redux/taskSlice';
import { employeeApi } from '../api/employeeApi';
import Table from '../components/Common/Table';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Toast from '../components/Common/Toast';

const TaskManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { tasks, pagination, loading } = useSelector((state: RootState) => state.tasks);

  const isAdmin = user?.role === 'Admin';

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [viewingTask, setViewingTask] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'Medium', status: 'Pending',
    start_date: '', due_date: '', assigned_to: ''
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'warning' } | null>(null);

  // Fetch employee list for assignment dropdown (Admin only)
  useEffect(() => {
    if (isAdmin) {
      employeeApi.getEmployees({ all: true })
        .then((data) => setEmployeeList(data.employees || []))
        .catch(() => {});
    }
  }, [isAdmin]);

  const loadTasks = useCallback(() => {
    dispatch(fetchTasks({ page, limit: 10, search, priority: filterPriority, status: filterStatus, sortField, sortOrder }));
  }, [dispatch, page, search, filterPriority, filterStatus, sortField, sortOrder]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadTasks();
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
    setEditingTask(null);
    setFormData({ title: '', description: '', priority: 'Medium', status: 'Pending', start_date: '', due_date: '', assigned_to: '' });
    setAttachment(null);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    const sd = task.start_date ? new Date(task.start_date).toISOString().split('T')[0] : '';
    const dd = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '';
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      start_date: sd,
      due_date: dd,
      assigned_to: task.assigned_to?.toString() || ''
    });
    setAttachment(null);
    setFormError('');
    setShowModal(true);
  };

  const openDetailModal = (task: any) => {
    setViewingTask(task);
    setShowDetailModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.start_date || !formData.due_date) {
      setFormError('Title, Start Date, and Due Date are required');
      return;
    }

    if (new Date(formData.due_date) < new Date(formData.start_date)) {
      setFormError('Due Date cannot be earlier than Start Date');
      return;
    }

    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('priority', formData.priority);
      fd.append('status', formData.status);
      fd.append('start_date', formData.start_date);
      fd.append('due_date', formData.due_date);
      if (formData.assigned_to) fd.append('assigned_to', formData.assigned_to);
      if (attachment) fd.append('attachment', attachment);

      if (editingTask) {
        const result = await dispatch(updateTask({ id: editingTask.id, formData: fd }));
        if (updateTask.fulfilled.match(result)) {
          setToast({ message: 'Task updated successfully', type: 'success' });
          setShowModal(false);
          loadTasks();
        } else {
          setFormError((result.payload as string) || 'Update failed');
        }
      } else {
        const result = await dispatch(createTask(fd));
        if (createTask.fulfilled.match(result)) {
          setToast({ message: 'Task created successfully', type: 'success' });
          setShowModal(false);
          loadTasks();
        } else {
          setFormError((result.payload as string) || 'Creation failed');
        }
      }
    } catch {
      setFormError('An unexpected error occurred');
    }
  };

  // Employee status update (simple inline)
  const handleStatusChange = async (task: any, newStatus: string) => {
    const result = await dispatch(updateTask({ id: task.id, formData: { status: newStatus } }));
    if (updateTask.fulfilled.match(result)) {
      setToast({ message: `Task marked as "${newStatus}"`, type: 'success' });
      loadTasks();
    } else {
      setToast({ message: (result.payload as string) || 'Status update failed', type: 'danger' });
    }
  };

  const confirmDelete = (task: any) => {
    setDeleteTarget(task);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteTask(deleteTarget.id));
    if (deleteTask.fulfilled.match(result)) {
      setToast({ message: 'Task deleted successfully', type: 'success' });
      loadTasks();
    } else {
      setToast({ message: (result.payload as string) || 'Delete failed', type: 'danger' });
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const getStatusClass = (status: string) => {
    if (status === 'Completed') return 'completed';
    if (status === 'In Progress') return 'in-progress';
    return 'pending';
  };

  const getPriorityClass = (priority: string) => priority.toLowerCase();

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'due_date', label: 'Due Date', sortable: true },
    ...(isAdmin ? [{ key: 'assigned_name', label: 'Assigned To' }] : []),
    { key: 'actions', label: 'Actions' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>{isAdmin ? 'Task Management' : 'My Tasks'}</h1>
        {isAdmin && <Button onClick={openCreateModal} icon="➕">New Task</Button>}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <select className="filter-select" value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}>
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Task Table */}
      <Table
        columns={columns}
        data={tasks}
        loading={loading}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No tasks found."
        renderRow={(task: any) => (
          <tr key={task.id}>
            <td>
              <span style={{ cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 600 }} onClick={() => openDetailModal(task)}>
                {task.title}
              </span>
            </td>
            <td><span className={`badge-priority ${getPriorityClass(task.priority)}`}>{task.priority}</span></td>
            <td><span className={`badge-status ${getStatusClass(task.status)}`}>{task.status}</span></td>
            <td>
              {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
              {task.status !== 'Completed' && task.due_date && new Date(task.due_date) < new Date() && (
                <span style={{ color: 'var(--danger-color)', fontWeight: 600, marginLeft: '6px', fontSize: '0.75rem' }}>OVERDUE</span>
              )}
            </td>
            {isAdmin && <td>{task.assigned_name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>}
            <td>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <Button variant="secondary" size="sm" onClick={() => openDetailModal(task)}>👁️</Button>
                {isAdmin && task.status !== 'Completed' && (
                  <Button variant="secondary" size="sm" onClick={() => openEditModal(task)}>✏️</Button>
                )}
                {!isAdmin && task.status !== 'Completed' && (
                  <select
                    className="filter-select"
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    style={{ padding: '4px 8px', fontSize: '0.78rem', minWidth: '110px' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                )}
                {isAdmin && <Button variant="danger" size="sm" onClick={() => confirmDelete(task)}>🗑️</Button>}
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
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Previous</Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), Math.min(pagination.totalPages, page + 2))
              .map((p) => (
                <Button key={p} variant={p === page ? 'primary' : 'secondary'} size="sm" onClick={() => setPage(p)}>{p}</Button>
              ))}
            <Button variant="secondary" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
          </div>
        </div>
      )}

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={showModal}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleFormSubmit} loading={loading}>
              {editingTask ? 'Update Task' : 'Create Task'}
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
          <Input id="task-title" label="Title" placeholder="Task title" value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          
          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea id="task-desc" className="form-control" rows={3} placeholder="Optional description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select id="task-priority" label="Priority" value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' }
              ]} required />
            
            {editingTask && (
              <Select id="task-status" label="Status" value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'Pending', label: 'Pending' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Completed', label: 'Completed' }
                ]} />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input id="task-start" label="Start Date" type="date" value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required />
            <Input id="task-due" label="Due Date" type="date" value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} required />
          </div>

          {isAdmin && (
            <Select id="task-assign" label="Assign To" value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              placeholder="Select an employee..."
              options={employeeList.map(emp => ({ value: emp.id.toString(), label: `${emp.name} (${emp.email})` }))} />
          )}

          <div className="form-group">
            <label>Attachment (PDF, JPG, PNG — max 5 MB)</label>
            <input
              type="file"
              className="form-control"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file && file.size > 5 * 1024 * 1024) {
                  setFormError('File size must be under 5 MB');
                  e.target.value = '';
                  return;
                }
                setAttachment(file);
              }}
            />
          </div>
        </form>
      </Modal>

      {/* Task Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        title="Task Details"
        onClose={() => setShowDetailModal(false)}
      >
        {viewingTask && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</label>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{viewingTask.title}</p>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
              <p>{viewingTask.description || 'No description'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</label>
                <p><span className={`badge-priority ${getPriorityClass(viewingTask.priority)}`}>{viewingTask.priority}</span></p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                <p><span className={`badge-status ${getStatusClass(viewingTask.status)}`}>{viewingTask.status}</span></p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Start Date</label>
                <p>{viewingTask.start_date ? new Date(viewingTask.start_date).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Due Date</label>
                <p>{viewingTask.due_date ? new Date(viewingTask.due_date).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned To</label>
                <p>{viewingTask.assigned_name || 'Unassigned'}</p>
              </div>
            </div>
            {viewingTask.attachment_path && (
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attachment</label>
                <p>
                  <a
                    href={`http://localhost:5000/${viewingTask.attachment_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary-color)', fontWeight: 600 }}
                  >
                    📎 View / Download Attachment
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
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
        <p>Are you sure you want to delete task <strong>"{deleteTarget?.title}"</strong>?</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>This action cannot be undone.</p>
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

export default TaskManagement;
