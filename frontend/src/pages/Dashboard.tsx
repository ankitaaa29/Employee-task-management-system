import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchDashboardStats } from '../redux/taskSlice';
import Card from '../components/Common/Card';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { dashboardStats, dashboardCharts, loading } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const isAdmin = user?.role === 'Admin';

  if (loading && !dashboardStats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{
            width: '40px', height: '40px', border: '4px solid #e2e8f0',
            borderTopColor: 'var(--primary-color)', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 12px'
          }} />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>{isAdmin ? 'Admin Dashboard' : 'My Dashboard'}</h1>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Welcome back, <strong>{user?.name}</strong>
        </span>
      </div>

      {/* Dashboard Stats Cards */}
      {isAdmin && dashboardStats && (
        <div className="dashboard-grid">
          <Card value={dashboardStats.totalEmployees} label="Total Employees" icon="👥" variant="primary" />
          <Card value={dashboardStats.totalTasks} label="Total Tasks" icon="📋" variant="accent" />
          <Card value={dashboardStats.completedTasks} label="Completed Tasks" icon="✅" variant="success" />
          <Card value={dashboardStats.pendingTasks} label="Pending Tasks" icon="⏳" variant="warning" />
        </div>
      )}

      {!isAdmin && dashboardStats && (
        <div className="dashboard-grid">
          <Card value={dashboardStats.totalTasks} label="My Tasks" icon="📋" variant="primary" />
          <Card value={dashboardStats.completedTasks} label="Completed" icon="✅" variant="success" />
          <Card value={dashboardStats.pendingTasks} label="Pending" icon="⏳" variant="warning" />
          <Card value={dashboardStats.overdueTasks} label="Overdue" icon="🔴" variant="danger" />
        </div>
      )}

      {/* Charts Section - Admin Only */}
      {isAdmin && dashboardCharts && (
        <div className="charts-grid">
          {/* Monthly Trends Bar Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">📊 Monthly Task Trends</span>
            </div>
            <div className="flexbar-chart">
              {dashboardCharts.monthlyTrends && dashboardCharts.monthlyTrends.length > 0 ? (
                dashboardCharts.monthlyTrends.map((item: any, idx: number) => {
                  const maxTotal = Math.max(...dashboardCharts.monthlyTrends.map((t: any) => t.total), 1);
                  return (
                    <div key={idx}>
                      <div className="flexbar-row">
                        <span className="flexbar-label">{item.month}</span>
                        <div className="flexbar-track">
                          <div
                            className="flexbar-fill"
                            style={{
                              width: `${(item.total / maxTotal) * 100}%`,
                              backgroundColor: 'var(--primary-color)'
                            }}
                          />
                        </div>
                        <span className="flexbar-value">{item.total}</span>
                      </div>
                      <div className="flexbar-row" style={{ marginTop: '-4px' }}>
                        <span className="flexbar-label" style={{ fontSize: '0.7rem', color: 'var(--success-color)' }}>Done</span>
                        <div className="flexbar-track" style={{ height: '6px' }}>
                          <div
                            className="flexbar-fill"
                            style={{
                              width: `${(item.completed / Math.max(item.total, 1)) * 100}%`,
                              backgroundColor: 'var(--success-color)'
                            }}
                          />
                        </div>
                        <span className="flexbar-value" style={{ fontSize: '0.75rem', color: 'var(--success-color)' }}>{item.completed}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>
                  No trend data yet. Create tasks to see trends.
                </div>
              )}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">🎯 Priority Distribution</span>
            </div>
            <div className="priority-sim">
              <div className="priority-sim-bars">
                {dashboardCharts.priorityDistribution && dashboardCharts.priorityDistribution.length > 0 ? (
                  (() => {
                    const total = dashboardCharts.priorityDistribution.reduce((a: number, b: any) => a + b.count, 0) || 1;
                    const colors: Record<string, string> = { High: '#ef4444', Medium: '#3b82f6', Low: '#94a3b8' };
                    return dashboardCharts.priorityDistribution.map((item: any, idx: number) => (
                      <div className="priority-sim-bar-item" key={idx}>
                        <div className="priority-sim-bar-header">
                          <span style={{ color: colors[item.priority] || '#888' }}>{item.priority}</span>
                          <span>{item.count} ({Math.round((item.count / total) * 100)}%)</span>
                        </div>
                        <div className="priority-sim-bar-track">
                          <div
                            className="priority-sim-bar-fill"
                            style={{
                              width: `${(item.count / total) * 100}%`,
                              backgroundColor: colors[item.priority] || '#888'
                            }}
                          />
                        </div>
                      </div>
                    ));
                  })()
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>
                    No tasks yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick overview for employees */}
      {!isAdmin && dashboardStats && (
        <div className="chart-card" style={{ marginTop: '10px' }}>
          <div className="chart-header">
            <span className="chart-title">📈 Your Progress</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', padding: '10px 0' }}>
            <div className="progress-ring-wrapper" style={{ width: '120px', height: '120px' }}>
              <svg viewBox="0 0 120 120" width="120" height="120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="var(--success-color)" strokeWidth="10"
                  strokeDasharray={`${(dashboardStats.completedTasks / Math.max(dashboardStats.totalTasks, 1)) * 314} 314`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <span className="progress-ring-text" style={{ fontSize: '1.3rem' }}>
                {dashboardStats.totalTasks > 0
                  ? `${Math.round((dashboardStats.completedTasks / dashboardStats.totalTasks) * 100)}%`
                  : '0%'}
              </span>
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                You have completed <strong style={{ color: 'var(--success-color)' }}>{dashboardStats.completedTasks}</strong> out
                of <strong>{dashboardStats.totalTasks}</strong> tasks.
              </p>
              {dashboardStats.overdueTasks > 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--danger-color)', fontWeight: 600 }}>
                  ⚠ {dashboardStats.overdueTasks} task(s) are overdue!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
