import React from 'react';

interface CardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  value,
  label,
  icon,
  variant = 'primary',
  className = ''
}) => {
  return (
    <div className={`card card-${variant} ${className}`}>
      <div className="card-icon">
        {icon}
      </div>
      <div className="card-details">
        <span className="card-value">{value}</span>
        <span className="card-label">{label}</span>
      </div>
    </div>
  );
};
export default Card;
