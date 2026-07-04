import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  placeholder,
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
      <select
        id={id}
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
export default Select;
