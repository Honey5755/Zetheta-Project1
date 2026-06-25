/**
 * Accessible step progress indicator (Spec A1.8 / B4.2).
 *
 * Rendered as an ordered list inside a labelled <nav>. The current step is
 * marked with `aria-current="step"` and the whole control exposes a concise
 * "Step X of Y" label to assistive tech via aria-label.
 *
 * @param {Object} props
 * @param {import('../../constants/steps.js').StepDef[]} props.steps  Visible steps.
 * @param {number} props.currentIndex  Index of the active step within `steps`.
 * @param {string[]} props.visitedKeys  Keys the user has already reached.
 * @param {(key: string) => void} [props.onStepSelect]  Navigate to a visited step.
 */
function ProgressBar({
  steps, currentIndex, visitedKeys, onStepSelect,
}) {
  const total = steps.length;
  const percent = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <nav aria-label={`Application progress: step ${currentIndex + 1} of ${total}`}>
      {/* Visual progress track */}
      <div
        className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="presentation"
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="flex flex-wrap gap-2">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentIndex;
          const isComplete = idx < currentIndex;
          const isVisited = visitedKeys.includes(step.key);
          const canJump = isVisited && !isCurrent && typeof onStepSelect === 'function';

          let stateClasses = 'border-slate-300 bg-white text-slate-500';
          if (isCurrent) stateClasses = 'border-brand bg-brand text-white';
          else if (isComplete) stateClasses = 'border-accent bg-accent/10 text-accent-700';

          const content = (
            <span className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${stateClasses}`}
                aria-hidden="true"
              >
                {isComplete ? '✓' : idx + 1}
              </span>
              <span className="hidden text-sm font-medium sm:inline">
                {step.shortTitle}
              </span>
            </span>
          );

          return (
            <li
              key={step.key}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex items-center"
            >
              {canJump ? (
                <button
                  type="button"
                  onClick={() => onStepSelect(step.key)}
                  className="tap-target rounded px-1 py-1 hover:bg-slate-100"
                >
                  {content}
                  <span className="sr-only">{`Go to step ${idx + 1}, ${step.title}`}</span>
                </button>
              ) : (
                <span className="px-1 py-1">
                  {content}
                  <span className="sr-only">
                    {`Step ${idx + 1}, ${step.title}${isCurrent ? ' (current)' : ''}`}
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default ProgressBar;
