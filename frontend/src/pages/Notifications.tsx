import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../redux/notificationSlice';
import Button from '../components/Common/Button';

const Notifications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, loading } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Notifications</h1>
        {notifications.some(n => !n.is_read) && (
          <Button variant="secondary" onClick={handleMarkAllAsRead}>
            ✓ Mark All as Read
          </Button>
        )}
      </div>

      {loading && notifications.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <div style={{
            width: '30px', height: '30px', border: '3px solid #e2e8f0',
            borderTopColor: 'var(--primary-color)', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <h3 className="empty-state-title">All Caught Up!</h3>
          <p className="empty-state-desc">You don't have any notifications right now.</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((n) => (
            <div key={n.id} className={`notification-item ${!n.is_read ? 'unread' : ''}`}>
              {!n.is_read && <div className="notification-bullet" />}
              <div className="notification-body">
                <p className="notification-msg">{n.message}</p>
                <span className="notification-time">{formatTime(n.created_at)}</span>
              </div>
              {!n.is_read && (
                <span
                  className="notification-action"
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  Mark as Read
                </span>
              )}
            </div>
          ))}
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

export default Notifications;
