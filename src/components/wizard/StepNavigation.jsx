/**
 * Footer navigation for the wizard: Previous / Save Draft / Next.
 *
 * The "Next" action is owned by the parent (it runs per-step validation before
 * advancing). On the final step, the primary action is replaced by the step's
 * own Submit button, so Next is hidden here.
 *
 * @param {Object} props
 * @param {boolean} props.isFirst
 * @param {boolean} props.isLast
 * @param {boolean} [props.isAdvancing]  Disables Next while validation runs.
 * @param {() => void} props.onPrev
 * @param {() => void} props.onNext
 * @param {() => void} [props.onSaveDraft]
 */
function StepNavigation({
  isFirst,
  isLast,
  isAdvancing = false,
  onPrev,
  onNext,
  onSaveDraft,
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst}
        className="tap-target rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Previous
      </button>

      <div className="flex items-center gap-3">
        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            className="tap-target rounded-lg px-4 py-2.5 text-sm font-semibold text-brand underline-offset-2 transition hover:underline"
          >
            Save Draft
          </button>
        )}

        {!isLast && (
          <button
            type="button"
            onClick={onNext}
            disabled={isAdvancing}
            className="tap-target rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAdvancing ? 'Checking…' : 'Continue →'}
          </button>
        )}
      </div>
    </div>
  );
}

export default StepNavigation;
