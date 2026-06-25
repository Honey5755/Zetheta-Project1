import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn.js';
import ErrorMessage from './ErrorMessage.jsx';

/**
 * @typedef {Object} RadioOption
 * @property {string} value
 * @property {string} label
 * @property {string} [description]
 * @property {string} [icon]  Optional emoji/glyph shown in a badge.
 */

/**
 * Accessible radio group rendered as a `<fieldset>`/`<legend>` so the group
 * label is announced once (WCAG 1.3.1). Options render as selectable cards; the
 * native radio is visually hidden but kept for keyboard + assistive tech. The
 * same `register` result is spread onto every radio (RHF handles the shared
 * name); a `value`/`onChange` pair drives controlled mode.
 *
 * @param {Object} props
 * @param {string} props.legend
 * @param {string} props.name
 * @param {RadioOption[]} props.options
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 * @param {string} [props.helpText]
 * @param {string} [props.value]
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
      <legend className="text-sm font-semibold text-slate-700">
        {legend}
        {required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger-700">*</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </legend>
      <div
        className={cn(
          'mt-2.5',
          orientation === 'horizontal' ? 'flex flex-row flex-wrap gap-3' : 'flex flex-col gap-2.5',
        )}
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={cn(
                'tap-target group flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition',
                'focus-within:ring-2 focus-within:ring-brand/40',
                selected
                  ? 'border-brand bg-brand-50 shadow-card'
                  : 'border-slate-200 hover:border-brand/50 hover:bg-slate-50',
              )}
            >
              <input
                type="radio"
                ref={ref}
                name={name}
                value={opt.value}
                checked={value !== undefined ? selected : undefined}
                onChange={onChange}
                onBlur={onBlur}
                className="peer sr-only"
              />
              {opt.icon && (
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl transition',
                    selected ? 'bg-brand-gradient' : 'bg-slate-100',
                  )}
                  aria-hidden="true"
                >
                  {opt.icon}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">{opt.label}</span>
                {opt.description && (
                  <span className="mt-0.5 block text-xs text-slate-500">{opt.description}</span>
                )}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[11px] text-white transition',
                  selected ? 'border-brand bg-brand' : 'border-slate-300',
                )}
              >
                {selected ? '✓' : ''}
              </span>
            </label>
          );
        })}
      </div>
      {helpText && (
        <p id={helpId} className="mt-1 text-sm text-slate-500">{helpText}</p>
      )}
      <ErrorMessage id={errorId} message={error} />
    </fieldset>
  );
});

export default RadioGroup;
