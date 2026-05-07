export const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  noPadding = false,
  hoverable = false,
}) => {
  const baseStyles = 'bg-white border border-secondary-200 rounded-lg shadow-sm';
  const hoverStyles = hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : '';
  const paddingStyle = noPadding ? '' : 'p-6';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {title && (
        <div className={`border-b border-secondary-200 ${paddingStyle}`}>
          <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
          {subtitle && <p className="text-sm text-secondary-600 mt-1">{subtitle}</p>}
        </div>
      )}

      <div className={paddingStyle}>{children}</div>

      {footer && (
        <div className={`border-t border-secondary-200 ${paddingStyle} bg-secondary-50`}>
          {footer}
        </div>
      )}
    </div>
  );
};
