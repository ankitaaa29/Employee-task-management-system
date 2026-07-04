import React, { useEffect, useState } from 'react';
import { reportApi } from '../api/reportApi';
import Table from '../components/Common/Table';
import Button from '../components/Common/Button';
import Toast from '../components/Common/Toast';

type ReportType = 'completed' | 'pending' | 'employee-wise';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('completed');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'warning' } | null>(null);

  const loadReportData = async (type: ReportType) => {
    setLoading(true);
    try {
      let res;
      if (type === 'completed') {
        res = await reportApi.getCompletedReport();
      } else if (type === 'pending') {
        res = await reportApi.getPendingReport();
      } else {
        res = await reportApi.getEmployeeWiseReport();
      }
      if (res.success) {
        setData(res.data || []);
      } else {
        setToast({ message: res.message || 'Failed to load report data', type: 'danger' });
      }
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || 'Error fetching report data', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData(activeTab);
  }, [activeTab]);

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      setToast({ message: 'Generating export file...', type: 'warning' });
      let blob;
      if (format === 'csv') {
        blob = await reportApi.exportCSV(activeTab);
      } else {
        blob = await reportApi.exportExcel(activeTab);
      }
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}_report_${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setToast({ message: 'Report exported successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Failed to export report file', type: 'danger' });
    }
  };

  const completedColumns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'priority', label: 'Priority' },
    { key: 'assigned_name', label: 'Assigned To' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'due_date', label: 'Due Date' }
  ];

  const pendingColumns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'priority', label: 'Priority' },
    { key: 'assigned_name', label: 'Assigned To' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'is_overdue', label: 'Overdue' }
  ];

  const employeeWiseColumns = [
    { key: 'employee_name', label: 'Employee Name' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'total_tasks', label: 'Total' },
    { key: 'completed_tasks', label: 'Completed' },
    { key: 'pending_tasks', label: 'Pending' },
    { key: 'overdue_tasks', label: 'Overdue' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Reports Center</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" onClick={() => handleExport('csv')} disabled={data.length === 0}>
            📥 Export CSV
          </Button>
          <Button variant="primary" onClick={() => handleExport('excel')} disabled={data.length === 0}>
            📥 Export Excel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '24px',
        gap: '8px'
      }}>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'completed' ? '2px solid var(--primary-color)' : 'none',
            color: activeTab === 'completed' ? 'var(--primary-color)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Completed Tasks
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '2px solid var(--primary-color)' : 'none',
            color: activeTab === 'pending' ? 'var(--primary-color)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Pending Tasks
        </button>
        <button
          onClick={() => setActiveTab('employee-wise')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'employee-wise' ? '2px solid var(--primary-color)' : 'none',
            color: activeTab === 'employee-wise' ? 'var(--primary-color)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Employee-wise Breakdown
        </button>
      </div>

      {/* Table Data Preview */}
      {activeTab === 'completed' && (
        <Table
          columns={completedColumns}
          data={data}
          loading={loading}
          emptyMessage="No completed tasks to display in report."
          renderRow={(task: any) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td><strong>{task.title}</strong></td>
              <td>
                <span className={`badge-priority ${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
              </td>
              <td>{task.assigned_name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
              <td>{task.start_date ? new Date(task.start_date).toLocaleDateString() : '—'}</td>
              <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}</td>
            </tr>
          )}
        />
      )}

      {activeTab === 'pending' && (
        <Table
          columns={pendingColumns}
          data={data}
          loading={loading}
          emptyMessage="No pending tasks to display in report."
          renderRow={(task: any) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td><strong>{task.title}</strong></td>
              <td>
                <span className={`badge-priority ${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
              </td>
              <td>{task.assigned_name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
              <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}</td>
              <td>
                <span style={{
                  color: task.is_overdue === 'Yes' ? 'var(--danger-color)' : 'var(--success-color)',
                  fontWeight: 600
                }}>
                  {task.is_overdue === 'Yes' ? 'Yes 🔴' : 'No'}
                </span>
              </td>
            </tr>
          )}
        />
      )}

      {activeTab === 'employee-wise' && (
        <Table
          columns={employeeWiseColumns}
          data={data}
          loading={loading}
          emptyMessage="No employee records to display."
          renderRow={(emp: any) => (
            <tr key={emp.employee_id}>
              <td><strong>{emp.employee_name}</strong></td>
              <td>{emp.department || '—'}</td>
              <td>{emp.designation || '—'}</td>
              <td><strong>{emp.total_tasks}</strong></td>
              <td style={{ color: 'var(--success-color)', fontWeight: 600 }}>{emp.completed_tasks}</td>
              <td style={{ color: 'var(--warning-color)', fontWeight: 600 }}>{emp.pending_tasks}</td>
              <td style={{ color: 'var(--danger-color)', fontWeight: 600 }}>{emp.overdue_tasks}</td>
            </tr>
          )}
        />
      )}

      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
};

export default Reports;
