import { create } from 'zustand';

/**
 * Wizard navigation store.
 *
 * Field *values* live in the single React Hook Form instance (the source of
 * truth); this store only owns navigation state — which step is active and
 * which steps have been reached. Keeping these separate avoids dual-source
 * drift while still letting auto-save serialise `currentStepKey` alongside the
 * RHF values (Spec C3.4).
 */

const FIRST_STEP = 'loan-type';

const useFormStore = create((set) => ({
  currentStepKey: FIRST_STEP,
  /** Step keys the user has reached (drives progress + "Edit" affordances). */
  visitedSteps: [FIRST_STEP],

  /** Navigate to a step by key, recording it as visited. */
  setStep: (key) => set((s) => ({
    currentStepKey: key,
    visitedSteps: s.visitedSteps.includes(key) ? s.visitedSteps : [...s.visitedSteps, key],
  })),

  /** Restore navigation position from a resumed draft. */
  hydrateStep: (key) => set((s) => {
    const target = key || FIRST_STEP;
    return {
      currentStepKey: target,
      visitedSteps: s.visitedSteps.includes(target)
        ? s.visitedSteps
        : [...s.visitedSteps, target],
    };
  }),

  /** Reset to the first step (Start Fresh / post-submission). */
  resetWizard: () => set({ currentStepKey: FIRST_STEP, visitedSteps: [FIRST_STEP] }),
}));

export default useFormStore;
