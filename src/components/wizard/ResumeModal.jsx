import { useEffect, useRef } from 'react';
import { LOAN_PRODUCTS } from '../../constants/loanProducts.js';

/**
 * Resume-or-start-fresh modal shown on load when an encrypted draft exists
 * (Spec C3.4). Focus moves to the primary action on open for accessibility.
 *
 * @param {Object} props
 * @param {{ loanType: string, timestamp: string }} props.draft
 * @param {() => void} props.onResume
 * @param {() => void} props.onStartFresh
 */
function ResumeModal({ draft, onResume, onStartFresh }) {
  const resumeRef = useRef(null);
  useEffect(() => {
    resumeRef.current?.focus();
  }, []);

  const product = LOAN_PRODUCTS[draft.loanType];
  const label = product ? product.label : 'loan application';
  const savedAt = new Date(draft.timestamp).toLocaleString('en-IN');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="resume-title" className="text-lg font-bold text-slate-900">
          Resume your application?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {`We found a saved ${label} from ${savedAt}. Continue where you left off?`}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            ref={resumeRef}
            type="button"
            onClick={onResume}
            className="tap-target rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Resume application
          </button>
          <button
            type="button"
            onClick={onStartFresh}
            className="tap-target rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Start fresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeModal;
