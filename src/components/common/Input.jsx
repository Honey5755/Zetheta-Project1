import {
  createContext, forwardRef, useCallback, useContext, useEffect, useId, useMemo, useState,
} from 'react';
import { cn } from '../../utils/cn.js';
import ErrorMessage from './ErrorMessage.jsx';

/**
 * Compound text-input field (Spec C2.2 — Compound Component Pattern).
 *
 * Usage:
 *   <Input error={errors.fullName?.message} required>
 *     <Input.Label>Full name</Input.Label>
 *     <Input.Field {...register('fullName')} placeholder="As per PAN" />
 *     <Input.HelpText>Exactly as printed on your PAN card.</Input.HelpText>
 *     <Input.Error />
 *   </Input>
 *
 * The root supplies a shared context (generated id, error state, and a
 * registry of `aria-describedby` ids) so the label, field, help text and error
 * stay wired together for accessibility (WCAG 1.3.1 / 3.3.1) without the caller
 * repeating ids. `Input.Field` uses `forwardRef`, so React Hook Form's
 * `register()` (which supplies `ref`, `name`, `onChange`, `onBlur`) can be
 * spread straight onto it (uncontrolled), while a plain `value`/`onChange` pair
 * also works (controlled).
 */

const FieldContext = createContext(null);

function useFieldContext(component) {
  const ctx = useContext(FieldContext);
  if (!ctx) throw new Error(`${component} must be rendered inside <Input>`);
  return ctx;
}

/**
 * @param {Object} props
 * @param {string} [props.id]        Field id; auto-generated when omitted.
 * @param {string} [props.error]     Error message for the field.
 * @param {boolean} [props.required]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
function Input({
  id, error, required = false, className, children,
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  const hasError = Boolean(error);

  // Help-text elements register their ids so the field's aria-describedby only
  // references descriptors that actually exist in the DOM.
  const [helpIds, setHelpIds] = useState([]);
  const registerHelp = useCallback((helpId) => {
    setHelpIds((prev) => (prev.includes(helpId) ? prev : [...prev, helpId]));
    return () => setHelpIds((prev) => prev.filter((hid) => hid !== helpId));
  }, []);

  const describedBy = useMemo(() => {
    const ids = [...helpIds];
    if (hasError) ids.push(errorId);
    return ids.length ? ids.join(' ') : undefined;
  }, [helpIds, hasError, errorId]);

  const value = useMemo(
    () => ({
      fieldId, errorId, error, hasError, required, describedBy, registerHelp,
    }),
    [fieldId, errorId, error, hasError, required, describedBy, registerHelp],
  );

  return (
    <FieldContext.Provider value={value}>
      <div className={cn('flex flex-col gap-1.5', className)}>{children}</div>
    </FieldContext.Provider>
  );
}

function Label({ children, className }) {
  const { fieldId, required } = useFieldContext('Input.Label');
  return (
    <label htmlFor={fieldId} className={cn('text-sm font-medium text-slate-700', className)}>
      {children}
      {required && (
        <>
          <span aria-hidden="true" className="ml-0.5 text-danger">*</span>
          <span className="sr-only"> (required)</span>
        </>
      )}
    </label>
  );
}

const Field = forwardRef(({ as: Component = 'input', className, ...props }, ref) => {
  const { fieldId, hasError, describedBy } = useFieldContext('Input.Field');
  return (
    <Component
      id={fieldId}
      ref={ref}
      aria-invalid={hasError || undefined}
      aria-describedby={describedBy}
      className={cn(
        'tap-target w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 shadow-sm transition',
        'placeholder:text-slate-400 focus:outline-none focus:ring-2',
        hasError
          ? 'border-danger focus:border-danger focus:ring-danger/40'
          : 'border-slate-300 focus:border-brand focus:ring-brand/40',
        className,
      )}
      {...props}
    />
  );
});

function HelpText({ children, className }) {
  const { fieldId, registerHelp } = useFieldContext('Input.HelpText');
  const helpId = `${fieldId}-help`;
  useEffect(() => registerHelp(helpId), [helpId, registerHelp]);
  return (
    <p id={helpId} className={cn('text-sm text-slate-500', className)}>
      {children}
    </p>
  );
}

function ErrorSlot({ className }) {
  const { error, errorId } = useFieldContext('Input.Error');
  return <ErrorMessage id={errorId} message={error} className={className} />;
}

Input.Label = Label;
Input.Field = Field;
Input.HelpText = HelpText;
Input.Error = ErrorSlot;

export default Input;
