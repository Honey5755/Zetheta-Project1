import { useEffect, useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import ErrorMessage from './ErrorMessage.jsx';

/**
 * E-signature capture (Spec A1.7, B4.4).
 *
 * Draw with mouse or touch; exports a base64 PNG on each stroke end, supports
 * Clear, and is responsive (canvas width tracks its container). A blurred
 * overlay covers a captured signature when the field loses focus, so it is not
 * trivially screen-captured (Spec B4.4).
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.value   base64 PNG data URL
 * @param {(dataUrl: string) => void} props.onChange
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 */
function SignatureCanvas({
  label, value, onChange, error, required = false,
}) {
  const padRef = useRef(null);
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(600);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const measure = () => {
      if (wrapRef.current) setWidth(wrapRef.current.clientWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Restore a previously captured signature (e.g. on resume) or after a resize
  // clears the canvas.
  useEffect(() => {
    if (value && padRef.current && padRef.current.isEmpty()) {
      padRef.current.fromDataURL(value);
    }
  }, [value, width]);

  const handleEnd = () => {
    if (padRef.current && !padRef.current.isEmpty()) {
      onChange(padRef.current.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    padRef.current?.clear();
    onChange('');
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
      </p>
      <div
        ref={wrapRef}
        tabIndex={-1}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="relative rounded-lg border border-slate-300 bg-white"
      >
        <SignaturePad
          ref={padRef}
          onEnd={handleEnd}
          canvasProps={{
            width, height: 160, className: 'rounded-lg', 'aria-label': label,
          }}
        />
        {!focused && value && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm">
            <span className="text-xs font-medium text-slate-500">Signature captured — tap to edit</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Sign using your mouse or finger.</span>
        <button
          type="button"
          onClick={handleClear}
          className="tap-target rounded px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          Clear
        </button>
      </div>
      <ErrorMessage id="signature-error" message={error} />
    </div>
  );
}

export default SignatureCanvas;
