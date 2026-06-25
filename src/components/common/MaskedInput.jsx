import { forwardRef, useId, useState } from 'react';
import { cn } from '../../utils/cn.js';
import ErrorMessage from './ErrorMessage.jsx';

/**
 * Masked PII input (Spec B4.4 — PAN / Aadhaar must show only the last few
 * characters after entry). The full value lives in form state; when the field
 * is *not* focused it renders a masked view (all but the last `visibleSuffix`
 * characters replaced by a bullet). On focus the real value is shown so the
 * user can edit it.
 *
 * Controlled: pass `value` (the real string) and `onChange` (receives the real,
 * optionally transformed, string). `forwardRef` is honoured for focus.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {() => void} [props.onBlur]
 * @param {(raw: string) => string} [props.transform]  e.g. uppercase for PAN.
 * @param {number} [props.visibleSuffix]  Trailing chars left unmasked (default 4).
 * @param {string} [props.name]
 * @param {string} [props.id]
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 * @param {string} [props.helpText]
 * @param {number} [props.maxLength]
 * @param {string} [props.placeholder]
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.endAdornment]  e.g. a verification badge.
 */
const MaskedInput = forwardRef((
  {
    label, value = '', onChange, onBlur, transform, visibleSuffix = 4, name, id,
    error, required = false, helpText, maxLength, placeholder, className, endAdornment, ...props
  },
  ref,
) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  const hasError = Boolean(error);
  const describedBy = [helpText && helpId, hasError && errorId].filter(Boolean).join(' ') || undefined;

  const [focused, setFocused] = useState(false);
  const real = value ?? '';
  const masked = real.length <= visibleSuffix
    ? real
    : '•'.repeat(real.length - visibleSuffix) + real.slice(-visibleSuffix);
  const display = focused ? real : masked;

  const handleChange = (event) => {
    const next = transform ? transform(event.target.value) : event.target.value;
    onChange(next);
  };

  const handleBlur = (event) => {
    setFocused(false);
    if (onBlur) onBlur(event);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-slate-700">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">*</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          ref={ref}
          name={name}
          type="text"
          autoComplete="off"
          value={display}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(
            'tap-target w-full rounded-xl border bg-white px-3 py-2.5 pr-12 font-mono tracking-wider text-slate-900 shadow-sm transition',
            'placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2',
            hasError
              ? 'border-danger focus:border-danger focus:ring-danger/40'
              : 'border-slate-300 focus:border-brand focus:ring-brand/40',
            className,
          )}
          {...props}
        />
        {endAdornment && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{endAdornment}</span>
        )}
      </div>
      {helpText && (
        <p id={helpId} className="text-sm text-slate-500">{helpText}</p>
      )}
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
});

export default MaskedInput;
