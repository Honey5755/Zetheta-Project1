import { cn } from '../../utils/cn.js';

/**
 * Accessible validation-error region (Spec B4.2, A4.2 — Razorpay case study).
 *
 * The element is *always mounted* so it acts as a persistent live region:
 * screen readers announce the message the moment it changes from empty to
 * populated. It carries both `role="alert"` and `aria-live="polite"` exactly as
 * the spec's WCAG checklist (3.3.1) requires, and reserves vertical space to
 * avoid layout shift (helps CLS).
 *
 * @param {Object} props
 * @param {string} props.id        Referenced by the field's aria-describedby.
 * @param {string} [props.message] The error text; empty/undefined renders blank.
 * @param {string} [props.className]
 */
function ErrorMessage({ id, message, className }) {
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={cn('min-h-[1.25rem] text-sm font-medium text-danger-700', className)}
    >
      {message || ''}
    </p>
  );
}

export default ErrorMessage;
