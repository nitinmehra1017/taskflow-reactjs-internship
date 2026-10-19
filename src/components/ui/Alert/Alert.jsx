import './Alert.scss';

const symbols = { success: '✓', error: '!', warning: '!', information: 'i' };

/** Static feedback by default. announce opts into status (polite) or alert (error). */
export default function Alert({
  title,
  children,
  variant = 'information',
  onDismiss,
  dismissLabel = 'Dismiss notification',
  announce = false,
  className = '',
  ...props
}) {
  return (
    <div
      {...props}
      className={`ui-alert ui-alert--${variant} ${className}`}
      role={announce ? (variant === 'error' ? 'alert' : 'status') : undefined}
      aria-atomic={announce ? true : undefined}
    >
      <span className="ui-alert__symbol" aria-hidden="true">
        {symbols[variant] || 'i'}
      </span>
      <div className="ui-alert__content">
        {title && <p className="ui-alert__title">{title}</p>}
        {children && <div>{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="ui-alert__dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel}
        >
          ×
        </button>
      )}
    </div>
  );
}
