import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn.js';
import ErrorMessage from './ErrorMessage.jsx';

/**
 * @typedef {Object} RadioOption
 * @property {string} value
 * @property {string} label
 * @property {string} [description]
 */

/**
 * Accessible radio group rendered as a `<fieldset>`/`<legend>` so the group
 * label is announced once (WCAG 1.3.1). The same `register` result is spread
 * onto every radio (React Hook Form's ref callback handles multiple nodes for a
 * shared name); a `value`/`onChange` pair drives it in controlled mode.
 *
 * @param {Object} props
 * @param {string} props.legend
 * @param {string} props.name
 * @param {RadioOption[]} props.options
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 * @param {string} [props.helpText]
 * @param {string} [props.value]            Controlled selected value.
 * @param {(e: Event) => void} [props.onChange]
 * @param {(e: Event) => void} [props.onBlur]
 * @param {'vertical' | 'horizontal'} [props.orientation]
 */
const RadioGroup = forwardRef((
  {
    legend, name, options = [], error, required = false, helpText,
    value, onChange, onBlur, orientation = 'vertical',
  },
  ref,
) => {
  const autoId = useId();
  const errorId = `${name || autoId}-error`;
  const helpId = `${name || autoId}-help`;
  const hasError = Boolean(error);
  const describedBy = [helpText && helpId, hasError && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset aria-describedby={describedBy} aria-invalid={hasError || undefined}>
      <legend className="text-sm font-medium text-slate-700">
        {legend}
        {required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">*</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </legend>
      <div
        className={cn(
          'mt-2 gap-2',
          orientation === 'horizontal' ? 'flex flex-row flex-wrap gap-3' : 'flex flex-col',
        )}
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              'tap-target flex cursor-pointer items-start gap-2 rounded-lg border p-3 transition',
              value === opt.value
                ? 'border-brand bg-brand-50'
                : 'border-slate-300 hover:bg-slate-50',
            )}
          >
            <input
              type="radio"
              ref={ref}
              name={name}
              value={opt.value}
              checked={value !== undefined ? value === opt.value : undefined}
              onChange={onChange}
              onBlur={onBlur}
              className="mt-0.5 h-4 w-4 accent-brand"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">{opt.label}</span>
              {opt.description && (
                <span className="block text-xs text-slate-500">{opt.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
      {helpText && (
        <p id={helpId} className="mt-1 text-sm text-slate-500">{helpText}</p>
      )}
      <ErrorMessage id={errorId} message={error} />
    </fieldset>
  );
});

export default RadioGroup;
