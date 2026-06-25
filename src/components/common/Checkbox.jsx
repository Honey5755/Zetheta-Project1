import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn.js';
import ErrorMessage from './ErrorMessage.jsx';

/**
 * Accessible single checkbox with an explicitly associated label (WCAG 1.3.1).
 * `forwardRef` enables React Hook Form `register`; `checked`/`onChange` enables
 * controlled use. Pass the label via `label` or as children.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.label]
 * @param {string} [props.id]
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 * @param {string} [props.helpText]
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.children]
 */
const Checkbox = forwardRef((
  {
    label, id, error, required = false, helpText, className, children, ...props
  },
  ref,
) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  const hasError = Boolean(error);
  const describedBy = [helpText && helpId, hasError && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className="flex cursor-pointer items-start gap-2.5">
        <input
          id={fieldId}
          ref={ref}
          type="checkbox"
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-brand focus:ring-2 focus:ring-brand/40"
          {...props}
        />
        <span className="text-sm text-slate-700">
          {label ?? children}
          {required && (
            <>
              <span aria-hidden="true" className="ml-0.5 text-danger">*</span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </span>
      </label>
      {helpText && (
        <p id={helpId} className="ml-7 text-sm text-slate-500">{helpText}</p>
      )}
      <ErrorMessage id={errorId} message={error} className="ml-7" />
    </div>
  );
});

export default Checkbox;
