import {
  lazy, Suspense, useEffect, useRef,
} from 'react';
import useFormStore from '../../store/useFormStore.js';
import { getVisibleSteps } from '../../constants/steps.js';
import ProgressBar from './ProgressBar.jsx';
import StepNavigation from './StepNavigation.jsx';

/**
 * Lazy step component registry (Spec A2.1 — code-split steps to keep the main
 * chunk < 300KB, B4.1). Keyed by the step `key` from the registry.
 */
const STEP_COMPONENTS = {
  'loan-type': lazy(() => import('../steps/Step1LoanType.jsx')),
  personal: lazy(() => import('../steps/Step2PersonalInfo.jsx')),
  kyc: lazy(() => import('../steps/Step3KYC.jsx')),
  address: lazy(() => import('../steps/Step4Address.jsx')),
  employment: lazy(() => import('../steps/Step5Employment.jsx')),
  'co-applicant': lazy(() => import('../steps/Step6CoApplicant.jsx')),
  documents: lazy(() => import('../steps/Step7Documents.jsx')),
  review: lazy(() => import('../steps/Step8Review.jsx')),
};

function StepFallback() {
  return (
    <div className="flex items-center justify-center py-16 text-slate-400" aria-live="polite">
      Loading step…
    </div>
  );
}

/**
 * The wizard shell: orchestrates step visibility, navigation, progress, and
 * accessible focus management. Individual steps own their own fields and
 * validation; the wizard only orchestrates (Spec A1.4 Pattern 3).
 */
function Wizard() {
  const currentStepKey = useFormStore((s) => s.currentStepKey);
  const formData = useFormStore((s) => s.formData);
  const visitedSteps = useFormStore((s) => s.visitedSteps);
  const goNext = useFormStore((s) => s.goNext);
  const goPrev = useFormStore((s) => s.goPrev);
  const goToStep = useFormStore((s) => s.goToStep);

  const visibleSteps = getVisibleSteps(formData);
  const currentIndex = Math.max(
    visibleSteps.findIndex((s) => s.key === currentStepKey),
    0,
  );
  const currentStep = visibleSteps[currentIndex];
  const StepComponent = STEP_COMPONENTS[currentStep.key];

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === visibleSteps.length - 1;

  // WCAG 2.4.3 — move focus to the step heading on every step transition so
  // keyboard and screen-reader users are not stranded at the page top.
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [currentStepKey]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="h-8 w-8" aria-hidden="true" />
          <span className="text-lg font-bold text-brand">LendSwift</span>
        </div>
        <span className="text-xs text-slate-400">Secure application</span>
      </header>

      <ProgressBar
        steps={visibleSteps}
        currentIndex={currentIndex}
        visitedKeys={visitedSteps}
        onStepSelect={goToStep}
      />

      <section
        className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        aria-labelledby="step-heading"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-700">
          {`Step ${currentStep.number} of 8`}
        </p>
        <h1
          id="step-heading"
          ref={headingRef}
          tabIndex={-1}
          className="mt-1 text-xl font-bold text-slate-900 outline-none sm:text-2xl"
        >
          {currentStep.title}
        </h1>

        <div className="mt-6">
          <Suspense fallback={<StepFallback />}>
            <StepComponent />
          </Suspense>
        </div>

        <StepNavigation
          isFirst={isFirst}
          isLast={isLast}
          onPrev={goPrev}
          onNext={goNext}
        />
      </section>
    </div>
  );
}

export default Wizard;
