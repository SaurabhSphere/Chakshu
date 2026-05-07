export const LoadingSpinner = ({ size = 'md', message = 'Loading...', fullScreen = false }) => {
  const sizeStyles = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const container = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-75'
    : 'flex flexlex-col items-center justify-center py-12';

  return (
    <div className={container}>
      <div className="flex flex-col items-center">
        <div className={`${sizeStyles[size]} animate-spin`}>
          <svg
            className="w-full h-full text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        {message && <p className="mt-4 text-secondary-700 font-semibold">{message}</p>}
      </div>
    </div>
  );
};
