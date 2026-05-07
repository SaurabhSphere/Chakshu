import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export const Alert = ({ variant = 'info', title, message, onClose, className = '' }) => {
  const variantStyles = {
    success: {
      bg: 'bg-success-50',
      border: 'border-success-300',
      text: 'text-success-800',
      color: 'text-success-600',
    },
    error: {
      bg: 'bg-danger-50',
      border: 'border-danger-300',
      text: 'text-danger-800',
      color: 'text-danger-600',
    },
    warning: {
      bg: 'bg-warning-50',
      border: 'border-warning-300',
      text: 'text-warning-800',
      color: 'text-warning-600',
    },
    info: {
      bg: 'bg-primary-50',
      border: 'border-primary-300',
      text: 'text-primary-800',
      color: 'text-primary-600',
    },
  };

  const iconMap = {
    success: CheckCircle,
    error: X,
    warning: AlertTriangle,
    info: Info,
  };
  const style = variantStyles[variant];
  const Icon = iconMap[variant];

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-lg p-4 flex items-start ${className}`}
    >
      <Icon className={`${style.color} w-5 h-5 mt-0.5 mr-3 flex-shrink-0`} />
      <div className="flex-1">
        {title && <h4 className={`font-semibold ${style.text}`}>{title}</h4>}
        {message && <p className={`text-sm ${style.text}`}>{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-3 ${style.color} hover:opacity-70 transition-opacity`}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export const ErrorAlert = ({ message, onClose, title = 'Error' }) => (
  <Alert variant="error" title={title} message={message} onClose={onClose} />
);

export const SuccessAlert = ({ message, onClose, title = 'Success' }) => (
  <Alert variant="success" title={title} message={message} onClose={onClose} />
);

export const InfoAlert = ({ message, onClose, title = 'Information' }) => (
  <Alert variant="info" title={title} message={message} onClose={onClose} />
);

export const WarningAlert = ({ message, onClose, title = 'Warning' }) => (
  <Alert variant="warning" title={title} message={message} onClose={onClose} />
);
