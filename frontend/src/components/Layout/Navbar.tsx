import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchNotifications } from '../../redux/notificationSlice';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
      // Poll notifications every 30 seconds to keep unread badges updated
      const interval = setInterval(() => {
        dispatch(fetchNotifications());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, user]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          ☰
        </button>
        <div className="navbar-title">
          <h2>TaskForce Portal</h2>
        </div>
      </div>

      <div className="navbar-actions">
        <div 
          className="notification-badge-container" 
          onClick={() => navigate('/notifications')}
          title="Notifications"
        >
          <span style={{ fontSize: '1.25rem' }}>🔔</span>
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </div>

        <div className="navbar-user" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className="user-avatar">
            {user ? getInitials(user.name) : 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'Role'}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
