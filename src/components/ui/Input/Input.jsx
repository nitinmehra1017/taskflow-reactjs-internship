import { useId } from 'react';
import './Input.scss';

/** Labeled native input. Accepts controlled value/onChange or native defaultValue. */
export default function Input({
  label,
  multiline = false,
  id,
  helperText,
  error,
  required = false,
  className = '',
  'aria-describedby': describedBy,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const descriptionIds =
    [describedBy, helperText && `${inputId}-helper`, error && `${inputId}-error`]
      .filter(Boolean)
      .join(' ') || undefined;

  const Control = multiline ? 'textarea' : 'input';
  return (
    <div className={`ui-field ${className}`}>
      <label className="ui-field__label" htmlFor={inputId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <Control
        {...props}
        id={inputId}
        required={required}
        className={`ui-field__control${error ? ' ui-field__control--error' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionIds}
      />
      {helperText && (
        <p id={`${inputId}-helper`} className="ui-field__hint">
          {helperText}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="ui-field__error">
          {error}
        </p>
      )}
    </div>
  );
}
