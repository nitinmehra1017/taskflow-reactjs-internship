import './Badge.scss';

/** Non-live inline label. Variants: success|warning|error|neutral|information. */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <span
      {...props}
      className={`ui-badge ui-badge--${variant} ui-badge--${size} ${className}`}
    >
      {children}
    </span>
  );
}
