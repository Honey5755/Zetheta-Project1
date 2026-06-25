import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn.js';
import ErrorMessage from './ErrorMessage.jsx';

/**
 * @typedef {Object} SelectOption
 * @property {string} value
 * @property {string} label
 */

/**
 * Accessible native `<select>` with label, help text and error wiring.
 * Uses `forwardRef` so it works with React Hook Form's `register` (uncontrolled)
 * or a `value`/`onChange` pair (controlled).
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {SelectOption[]} props.options
 * @param {string} [props.id]
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 * @param {string} [props.helpText]
 * @param {string} [props.placeholder]  Rendered as a disabled-value first option.
 * @param {string} [props.className]
 */
const Select = forwardRef((
  {
    label, options = [], id, error, required = false, helpText, placeholder, className, ...props
  },
  ref,
) => {
  const autoId = useId();
  const selectId = id ?? autoId;
  const errorId = `${selectId}-error`;
  const helpId = `${selectId}-help`;
  const hasError = Boolean(error);
  const describedBy = [helpText && helpId, hasError && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">*</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      <select
        id={selectId}
        ref={ref}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={cn(
          'tap-target w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 shadow-sm transition',
          'focus:outline-none focus:ring-2',
          hasError
            ? 'border-danger focus:border-danger focus:ring-danger/40'
            : 'border-slate-300 focus:border-brand focus:ring-brand/40',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && (
        <p id={helpId} className="text-sm text-slate-500">{helpText}</p>
      )}
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
});

export default Select;
