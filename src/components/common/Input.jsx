import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({
  label,
  error,
  required = false,
  icon: Icon = null,
  type = 'text',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-secondary-900 mb-2">
          {label}
          {required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 w-5 h-5 text-secondary-500" />
        )}

        <input
          type={inputType}
          className={`w-full px-4 py-2 ${Icon ? 'pl-10' : ''} ${isPasswordField ? 'pr-10' : ''} border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
            error ? 'border-danger-500 focus:ring-danger-500' : ''
          } ${className}`}
          {...props}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-secondary-500 hover:text-secondary-700 transition-colors"
            tabIndex="-1"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {error && <p className="text-danger-600 text-sm mt-1">{error}</p>}
    </div>
  );
};

export const TextArea = ({
  label,
  error,
  required = false,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-secondary-900 mb-2">
          {label}
          {required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}

      <textarea
        rows={rows}
        className={`w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
          error ? 'border-danger-500 focus:ring-danger-500' : ''
        } ${className}`}
        {...props}
      />

      {error && <p className="text-danger-600 text-sm mt-1">{error}</p>}
    </div>
  );
};

export const Select = ({
  label,
  error,
  required = false,
  options = [],
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-secondary-900 mb-2">
          {label}
          {required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}

      <select
        className={`w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
          error ? 'border-danger-500 focus:ring-danger-500' : ''
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="text-danger-600 text-sm mt-1">{error}</p>}
    </div>
  );
};

export const Checkbox = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      <label className="flex items-center">
        <input
          type="checkbox"
          className={`w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer ${className}`}
          {...props}
        />
        {label && <span className="ml-2 text-secondary-900">{label}</span>}
      </label>
      {error && <p className="text-danger-600 text-sm mt-1">{error}</p>}
    </div>
  );
};
