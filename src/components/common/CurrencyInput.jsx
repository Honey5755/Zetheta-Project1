import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn.js';
import { formatIndianNumber } from '../../utils/indianFormat.js';
import ErrorMessage from './ErrorMessage.jsx';

/**
 * Currency input with live Indian-format grouping and a ₹ prefix (Spec Day 2,
 * C3.3). Controlled: the form value is a plain integer (or '' when empty) and
 * `onChange` receives that number, while the visible text shows "10,50,000".
 * Intended for use with React Hook Form's `Controller`; `forwardRef` is honoured
 * for focus management.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {number | ''} props.value
 * @param {(value: number | '') => void} props.onChange
 * @param {() => void} [props.onBlur]
 * @param {string} [props.name]
 * @param {string} [props.id]
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 * @param {string} [props.helpText]
 * @param {string} [props.placeholder]
 * @param {string} [props.className]
 */
const CurrencyInput = forwardRef((
  {
    label, value, onChange, onBlur, name, id, error, required = false,
    helpText, placeholder = '0', className, ...props
  },
  ref,
) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  const hasError = Boolean(error);
  const describedBy = [helpText && helpId, hasError && errorId].filter(Boolean).join(' ') || undefined;

  const display = value === '' || value === null || value === undefined || Number.isNaN(Number(value))
    ? ''
    : formatIndianNumber(value);

  const handleChange = (event) => {
    const digits = event.target.value.replace(/[^0-9]/g, '');
    onChange(digits === '' ? '' : Number(digits));
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
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        >
          ₹
        </span>
        <input
          id={fieldId}
          ref={ref}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={display}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(
            'tap-target w-full rounded-lg border bg-white py-2.5 pl-7 pr-3 text-slate-900 shadow-sm transition',
            'placeholder:text-slate-400 focus:outline-none focus:ring-2',
            hasError
              ? 'border-danger focus:border-danger focus:ring-danger/40'
              : 'border-slate-300 focus:border-brand focus:ring-brand/40',
            className,
          )}
          {...props}
        />
      </div>
      {helpText && (
        <p id={helpId} className="text-sm text-slate-500">{helpText}</p>
      )}
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
});

export default CurrencyInput;
