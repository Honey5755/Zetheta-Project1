/**
 * Accessible connected stepper (Spec A1.8 / B4.2).
 *
 * A gradient progress track plus numbered circles joined by connector lines.
 * The current step is marked with `aria-current="step"`; visited steps are
 * jump-able; every step exposes a concise label to assistive tech.
 *
 * @param {Object} props
 * @param {import('../../constants/steps.js').StepDef[]} props.steps
 * @param {number} props.currentIndex
 * @param {string[]} props.visitedKeys
 * @param {(key: string) => void} [props.onStepSelect]
 */
function ProgressBar({
  steps, currentIndex, visitedKeys, onStepSelect,
}) {
  const total = steps.length;
  const percent = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <nav aria-label={`Application progress: step ${currentIndex + 1} of ${total}`}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80" role="presentation">
        <div
          className="h-full rounded-full bg-accent bg-accent-gradient transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="mt-3 flex items-start">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentIndex;
          const isComplete = idx < currentIndex;
          const canJump = visitedKeys.includes(step.key) && !isCurrent
            && typeof onStepSelect === 'function';

          let circle = 'border-slate-300 bg-white text-slate-400';
          if (isCurrent) circle = 'border-transparent bg-brand bg-brand-gradient text-white shadow-btn ring-4 ring-brand/15';
          else if (isComplete) circle = 'border-transparent bg-accent bg-accent-gradient text-white';

          const badge = (
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition ${circle}`}
              aria-hidden="true"
            >
              {isComplete ? '✓' : idx + 1}
            </span>
          );

          let label = 'text-slate-500';
          if (isCurrent) label = 'text-brand-800';
          else if (isComplete) label = 'text-accent-800';

          return (
            <li
              key={step.key}
              aria-current={isCurrent ? 'step' : undefined}
              className="flex flex-1 flex-col items-center"
            >
              <div className="flex w-full items-center">
                <span
                  className={`h-0.5 flex-1 rounded ${idx === 0 ? 'opacity-0' : ''} ${idx <= currentIndex ? 'bg-accent' : 'bg-slate-200'}`}
                  aria-hidden="true"
                />
                {canJump ? (
                  <button
                    type="button"
                    onClick={() => onStepSelect(step.key)}
                    className="rounded-full transition hover:scale-105"
                  >
                    {badge}
                    <span className="sr-only">{`Go to step ${idx + 1}, ${step.title}`}</span>
                  </button>
                ) : (
                  <span>
                    {badge}
                    <span className="sr-only">
                      {`Step ${idx + 1}, ${step.title}${isCurrent ? ' (current)' : ''}`}
                    </span>
                  </span>
                )}
                <span
                  className={`h-0.5 flex-1 rounded ${idx === total - 1 ? 'opacity-0' : ''} ${idx < currentIndex ? 'bg-accent' : 'bg-slate-200'}`}
                  aria-hidden="true"
                />
              </div>
              <span className={`mt-1.5 hidden text-center text-[11px] font-semibold sm:block ${label}`}>
                {step.shortTitle}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default ProgressBar;
