import { useEffect, useRef } from 'react';

/**
 * Submission success modal (Spec B2.1 Step 8) showing the client-generated
 * application reference number. Focus moves to the dialog heading on open.
 *
 * @param {Object} props
 * @param {string} props.referenceNumber
 * @param {() => void} props.onClose  Start a new application.
 */
function SuccessModal({ referenceNumber, onClose }) {
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-2xl text-accent-700" aria-hidden="true">
          ✓
        </div>
        <h2
          id="success-title"
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 text-xl font-bold text-slate-900 outline-none"
        >
          Application submitted!
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Thank you. Your loan application has been received and is being reviewed.
        </p>
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Reference number</p>
          <p className="mt-1 break-all font-mono text-sm font-semibold text-brand">{referenceNumber}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="tap-target mt-6 w-full rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Start a new application
        </button>
      </div>
    </div>
  );
}

export default SuccessModal;
