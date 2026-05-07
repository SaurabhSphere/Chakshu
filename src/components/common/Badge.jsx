import { getStatusColor } from '../../utils/formatters';

export const Badge = ({ children, variant = 'secondary', className = '' }) => {
  const variantStyles = {
    success: 'bg-success-100 text-success-800',
    danger: 'bg-danger-100 text-danger-800',
    warning: 'bg-warning-100 text-warning-800',
    info: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
  };

  const baseStyles = 'inline-block px-3 py-1 rounded-full text-sm font-semibold';

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status, className = '' }) => {
  const color = getStatusColor(status);
  return (
    <Badge variant={color} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
    </Badge>
  );
};
