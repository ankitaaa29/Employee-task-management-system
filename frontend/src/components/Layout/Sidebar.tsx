import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/authSlice';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        🚀 <span>TaskForce</span>
      </div>
      <ul className="sidebar-menu">
        <li className="sidebar-item" onClick={() => setIsOpen(false)}>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            📊 Dashboard
          </NavLink>
        </li>
        <li className="sidebar-item" onClick={() => setIsOpen(false)}>
          <NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : ''}>
            📋 Task Board
          </NavLink>
        </li>
        {isAdmin && (
          <li className="sidebar-item" onClick={() => setIsOpen(false)}>
            <NavLink to="/employees" className={({ isActive }) => isActive ? 'active' : ''}>
              👥 Employees
            </NavLink>
          </li>
        )}
        {isAdmin && (
          <li className="sidebar-item" onClick={() => setIsOpen(false)}>
            <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
              📈 Reports
            </NavLink>
          </li>
        )}
        <li className="sidebar-item" onClick={() => setIsOpen(false)}>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? 'active' : ''}>
            🔔 Notifications
          </NavLink>
        </li>
        <li className="sidebar-item" onClick={() => setIsOpen(false)}>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
            👤 Profile
          </NavLink>
        </li>
      </ul>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Log Out
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
