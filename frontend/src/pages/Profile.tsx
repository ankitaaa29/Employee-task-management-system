import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div>
      <div className="page-header">
        <h1>User Profile</h1>
      </div>

      {user && (
        <div className="profile-card">
          <div className="profile-avatar-sec">
            <div className="profile-avatar-large">
              {getInitials(user.name)}
            </div>
            <h2 className="profile-name-lg">{user.name}</h2>
            <span className="profile-role-lg">{user.role}</span>
          </div>

          <div className="profile-details-sec">
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              Account Information
            </h3>
            
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Full Name</span>
                <span className="profile-info-value">{user.name}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Email Address</span>
                <span className="profile-info-value">{user.email}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Account Type</span>
                <span className="profile-info-value">{user.role}</span>
              </div>
              
              {user.role === 'Employee' && (
                <>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Department</span>
                    <span className="profile-info-value">{user.department || '—'}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Designation</span>
                    <span className="profile-info-value">{user.designation || '—'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
