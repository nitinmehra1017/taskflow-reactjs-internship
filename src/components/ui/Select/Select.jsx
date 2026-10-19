import { useId } from 'react';
import './Select.scss';

/** Native single-select. options is an array of {value, label, disabled?}. */
export default function Select({
  label,
  options,
  id,
  placeholder,
  error,
  helperText,
  required = false,
  className = '',
  'aria-describedby': describedBy,
  ...props
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const descriptionIds =
    [describedBy, helperText && `${selectId}-helper`, error && `${selectId}-error`]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className={`ui-field ${className}`}>
      <label htmlFor={selectId} className="ui-field__label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <select
        {...props}
        id={selectId}
        required={required}
        className={`ui-field__control ui-select${error ? ' ui-field__control--error' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionIds}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(({ value, label: optionLabel, disabled }) => (
          <option key={value} value={value} disabled={disabled}>
            {optionLabel}
          </option>
        ))}
      </select>
      {helperText && (
        <p id={`${selectId}-helper`} className="ui-field__hint">
          {helperText}
        </p>
      )}
      {error && (
        <p id={`${selectId}-error`} className="ui-field__error">
          {error}
        </p>
      )}
    </div>
  );
}
