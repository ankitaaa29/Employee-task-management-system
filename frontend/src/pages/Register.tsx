import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { registerUser, clearError } from '../redux/authSlice';
import Button from '../components/Common/Button';
import Select from '../components/Common/Select';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Employee'>('Employee');
  
  // Employee-only optional fields (but required if role is Employee)
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');

  const [formError, setFormError] = useState('');
  const [formReady, setFormReady] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  // Defeat browser autofill: mount with readOnly, then remove after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setFormReady(true);
      // Force-clear any values the browser may have injected
      if (formRef.current) {
        const inputs = formRef.current.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        inputs.forEach((input) => {
          (input as HTMLInputElement).value = '';
        });
      }
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDepartment('');
      setDesignation('');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pass)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pass)) return 'Password must contain at least one number';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password || !confirmPassword || !role) {
      setFormError('Please fill out all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setFormError(passwordError);
      return;
    }

    if (role === 'Employee' && (!department || !designation)) {
      setFormError('Employees must enter their department and designation');
      return;
    }

    const resultAction = await dispatch(
      registerUser({
        name,
        email,
        password,
        confirmPassword,
        role,
        department: role === 'Employee' ? department : undefined,
        designation: role === 'Employee' ? designation : undefined,
      })
    );

    if (registerUser.fulfilled.match(resultAction)) {
      navigate('/dashboard');
    }
  };

  // Shared input props to defeat autofill
  const noAutofillProps = {
    readOnly: !formReady,
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => { e.target.removeAttribute('readonly'); },
    'data-lpignore': 'true' as const,
    'data-form-type': 'other' as const,
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div className="auth-logo">TaskForce</div>
          <p>Create your account and join the workspace</p>
        </div>

        {formError && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--danger-color)',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            fontWeight: 500
          }}>
            ⚠️ {formError}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--danger-color)',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            fontWeight: 500
          }}>
            ⚠️ {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} autoComplete="off">
          {/* Hidden decoy fields to absorb browser autofill */}
          <input type="text" name="decoy_user" style={{ display: 'none' }} tabIndex={-1} autoComplete="username" />
          <input type="password" name="decoy_pass" style={{ display: 'none' }} tabIndex={-1} autoComplete="current-password" />

          <div className="form-group">
            <label htmlFor="reg-name-field">
              Full Name <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              id="reg-name-field"
              name="reg_name_nofill"
              type="text"
              className="form-control"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="off"
              {...noAutofillProps}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email-field">
              Email Address <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              id="reg-email-field"
              name="reg_email_nofill"
              type="email"
              className="form-control"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              {...noAutofillProps}
            />
          </div>

          <Select
            id="role"
            label="Account Role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'Admin' | 'Employee')}
            options={[
              { value: 'Employee', label: 'Employee' },
              { value: 'Admin', label: 'Admin (Manager)' }
            ]}
            required
          />

          {role === 'Employee' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div className="form-group">
                <label htmlFor="reg-dept-field">
                  Department <span style={{ color: 'var(--danger-color)' }}>*</span>
                </label>
                <input
                  id="reg-dept-field"
                  name="reg_dept_nofill"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  autoComplete="off"
                  {...noAutofillProps}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-desig-field">
                  Designation <span style={{ color: 'var(--danger-color)' }}>*</span>
                </label>
                <input
                  id="reg-desig-field"
                  name="reg_desig_nofill"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Developer"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  autoComplete="off"
                  {...noAutofillProps}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reg-pass-field">
              Password <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              id="reg-pass-field"
              name="reg_pass_nofill"
              type="password"
              className="form-control"
              placeholder="Minimum 8 characters with numbers/caps"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              {...noAutofillProps}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-cpass-field">
              Confirm Password <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              id="reg-cpass-field"
              name="reg_cpass_nofill"
              type="password"
              className="form-control"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              {...noAutofillProps}
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            style={{ width: '100%', padding: '12px', marginTop: '15px' }}
          >
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
