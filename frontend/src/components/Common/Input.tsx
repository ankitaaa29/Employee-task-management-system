import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  className = '',
  required,
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id}>
          {label} {required && <span style={{ color: 'var(--danger-color)' }}>*</span>}
        </label>
      )}
      <input
        id={id}
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        required={required}
        {...props}
      />
      {error && (
        <span style={{ 
          fontSize: '0.8rem', 
          color: 'var(--danger-color)',
          fontWeight: 500,
          marginTop: '4px'
        }}>
          {error}
        </span>
      )}
      <style>{`
        .is-invalid {
          border-color: var(--danger-color) !important;
        }
        .is-invalid:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
        }
      `}</style>
    </div>
  );
};
export default Input;
