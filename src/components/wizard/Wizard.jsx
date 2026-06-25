import {
  lazy, Suspense, useCallback, useEffect, useRef, useState,
} from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useFormStore from '../../store/useFormStore.js';
import { getVisibleSteps } from '../../constants/steps.js';
import { defaultFormValues } from '../../constants/defaultFormValues.js';
import { getStepSchema } from '../../schemas/schemaFactory.js';
import { useAutoSave } from '../../hooks/useAutoSave.js';
import { useFormPersistence } from '../../hooks/useFormPersistence.js';
import ProgressBar from './ProgressBar.jsx';
import StepNavigation from './StepNavigation.jsx';
import ResumeModal from './ResumeModal.jsx';
import AutoSaveToast from './AutoSaveToast.jsx';
import SuccessModal from './SuccessModal.jsx';

/**
 * Lazy step registry (Spec A2.1 — code-split to keep the main chunk < 300KB).
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
    <div className="flex items-center justify-center py-16 text-slate-500" aria-live="polite">
      Loading step…
    </div>
  );
}

/**
 * The wizard shell. Holds the single React Hook Form instance (source of truth
 * for field values), validates the active step on "Continue", and orchestrates
 * step visibility/navigation. Accessible focus is moved to the step heading on
 * every transition (WCAG 2.4.3).
 */
function Wizard() {
  const currentStepKey = useFormStore((s) => s.currentStepKey);
  const visitedSteps = useFormStore((s) => s.visitedSteps);
  const setStep = useFormStore((s) => s.setStep);
  const hydrateStep = useFormStore((s) => s.hydrateStep);
  const submissionRef = useFormStore((s) => s.submissionRef);
  const resetWizard = useFormStore((s) => s.resetWizard);

  // The resolver reads the *current* step key at validation time via a ref, so
  // useForm's one-time options capture stays valid as the step changes.
  const stepKeyRef = useRef(currentStepKey);
  stepKeyRef.current = currentStepKey;

  const resolver = useCallback(
    (values, context, options) => zodResolver(getStepSchema(stepKeyRef.current, values))(
      values,
      context,
      options,
    ),
    [],
  );

  const methods = useForm({
    defaultValues: defaultFormValues,
    mode: 'onTouched',
    resolver,
  });

  // Encrypted auto-save (debounced) + resume-or-start-fresh on load (Spec C3.4).
  const { lastSavedAt, saveNow } = useAutoSave({
    watch: methods.watch,
    getValues: methods.getValues,
    getStepKey: () => stepKeyRef.current,
  });
  const persistence = useFormPersistence({ reset: methods.reset, onResume: hydrateStep });

  // Only the two fields that gate the conditional step need to be watched here.
  const loanType = methods.watch('loanType');
  const loanAmount = methods.watch('loanAmount');
  const visibleSteps = getVisibleSteps({ loanType, loanAmount });

  let currentIndex = visibleSteps.findIndex((s) => s.key === currentStepKey);
  if (currentIndex === -1) currentIndex = 0;
  const currentStep = visibleSteps[currentIndex];
  const StepComponent = STEP_COMPONENTS[currentStep.key];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === visibleSteps.length - 1;

  // If the active step is no longer visible (e.g. the co-applicant step was
  // removed after the amount dropped below threshold), snap to a valid step.
  useEffect(() => {
    if (!visibleSteps.some((s) => s.key === currentStepKey)) {
      setStep(visibleSteps[Math.min(currentIndex, visibleSteps.length - 1)].key);
    }
  }, [currentStepKey, visibleSteps, currentIndex, setStep]);

  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [currentStepKey]);

  const [advancing, setAdvancing] = useState(false);

  const handleNext = useCallback(async () => {
    setAdvancing(true);
    const valid = await methods.trigger();
    setAdvancing(false);
    if (!valid) {
      const [firstError] = Object.keys(methods.formState.errors);
      if (firstError) methods.setFocus(firstError);
      return;
    }
    const vis = getVisibleSteps(methods.getValues());
    const idx = vis.findIndex((s) => s.key === stepKeyRef.current);
    setStep(vis[Math.min(idx + 1, vis.length - 1)].key);
  }, [methods, setStep]);

  const handlePrev = useCallback(() => {
    const vis = getVisibleSteps(methods.getValues());
    const idx = vis.findIndex((s) => s.key === stepKeyRef.current);
    setStep(vis[Math.max(idx - 1, 0)].key);
  }, [methods, setStep]);

  const handleStartOver = useCallback(() => {
    methods.reset(defaultFormValues);
    resetWizard();
  }, [methods, resetWizard]);

  return (
    <FormProvider {...methods}>
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
        <header className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="h-11 w-11 rounded-2xl shadow-btn" aria-hidden="true" />
            <div>
              <p className="font-display text-xl font-extrabold leading-none text-brand-800">LendSwift</p>
              <p className="mt-1 text-xs text-slate-500">Smart lending, simplified</p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-card backdrop-blur sm:inline-flex">
            <span aria-hidden="true">🔒</span>
            Secure &amp; encrypted
          </span>
        </header>

        <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur">
          <ProgressBar
            steps={visibleSteps}
            currentIndex={currentIndex}
            visitedKeys={visitedSteps}
            onStepSelect={setStep}
          />
        </div>

        <section
          className="mt-5 animate-fade-in-up rounded-2xl border border-white/70 bg-white p-6 shadow-card-lg sm:p-8"
          aria-labelledby="step-heading"
        >
          <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-800">
            {`Step ${currentStep.number} of 8`}
          </span>
          <h1
            id="step-heading"
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 font-display text-2xl font-extrabold text-slate-900 outline-none sm:text-[27px]"
          >
            {currentStep.title}
          </h1>

          <form className="mt-6" onSubmit={(e) => e.preventDefault()} noValidate>
            <Suspense fallback={<StepFallback />}>
              <StepComponent />
            </Suspense>

            <StepNavigation
              isFirst={isFirst}
              isLast={isLast}
              isAdvancing={advancing}
              onPrev={handlePrev}
              onNext={handleNext}
              onSaveDraft={saveNow}
            />
          </form>
        </section>
      </div>

      <AutoSaveToast savedAt={lastSavedAt} />

      {persistence.hasDraft && !submissionRef && (
        <ResumeModal
          draft={persistence.draft}
          onResume={persistence.resume}
          onStartFresh={persistence.startFresh}
        />
      )}

      {submissionRef && (
        <SuccessModal referenceNumber={submissionRef} onClose={handleStartOver} />
      )}
    </FormProvider>
  );
}

export default Wizard;
