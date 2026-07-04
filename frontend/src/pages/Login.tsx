import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { login, clearError } from '../redux/authSlice';
import Button from '../components/Common/Button';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  const [formReady, setFormReady] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  // Defeat browser autofill: mount with readOnly, then remove after a delay
  // This prevents the browser from injecting saved credentials into the fields
  useEffect(() => {
    const timer = setTimeout(() => {
      setFormReady(true);
      // Force-clear any values the browser may have injected before React took control
      if (emailRef.current) {
        emailRef.current.value = '';
      }
      if (passwordRef.current) {
        passwordRef.current.value = '';
      }
      setEmail('');
      setPassword('');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    const resultAction = await dispatch(login({ email, password }));
    if (login.fulfilled.match(resultAction)) {
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">TaskForce</div>
          <p>Sign in to manage tasks & track progress</p>
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

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Hidden decoy fields to absorb browser autofill */}
          <input type="text" name="decoy_user" style={{ display: 'none' }} tabIndex={-1} autoComplete="username" />
          <input type="password" name="decoy_pass" style={{ display: 'none' }} tabIndex={-1} autoComplete="current-password" />

          <div className="form-group">
            <label htmlFor="login-email-field">
              Email Address <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              ref={emailRef}
              id="login-email-field"
              name="login_email_nofill"
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={!formReady}
              onFocus={(e) => { e.target.removeAttribute('readonly'); }}
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-pass-field">
              Password <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              ref={passwordRef}
              id="login-pass-field"
              name="login_pass_nofill"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              readOnly={!formReady}
              onFocus={(e) => { e.target.removeAttribute('readonly'); }}
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          <div className="auth-checkbox-group">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  setRememberMe(e.target.checked);
                  if (!e.target.checked) {
                    localStorage.removeItem('remembered_email');
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
              Remember Me
            </label>
          </div>

          <Button
            type="submit"
            loading={loading}
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
