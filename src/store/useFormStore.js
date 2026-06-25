import { create } from 'zustand';
import { getVisibleStepKeys } from '../constants/steps.js';

/**
 * Global wizard + form-data store (Spec A1.4 Pattern 3 — Wizard + central
 * store). Keeping accumulated data here (rather than component-local state)
 * is what makes cross-step validation, auto-save, and back-navigation safe;
 * unmounting a step never destroys its data (cf. Spec A4.3).
 *
 * Navigation tracks the *current step key* (not an index), so inserting or
 * removing the conditional Co-Applicant step keeps the user in place.
 *
 * @typedef {Object} FormState
 * @property {string} currentStepKey
 * @property {Record<string, unknown>} formData
 * @property {Set<string>} visitedSteps
 */

const FIRST_STEP = 'loan-type';

const useFormStore = create((set) => ({
  currentStepKey: FIRST_STEP,
  /** Accumulated, validated-or-draft data across every step. */
  formData: {},
  /** Step keys the user has reached (for progress + edit affordances). */
  visitedSteps: [FIRST_STEP],

  /**
   * Merge a partial patch into the accumulated form data.
   * @param {Record<string, unknown>} patch
   */
  setFormData: (patch) => set((s) => ({ formData: { ...s.formData, ...patch } })),

  /** Jump to a specific step by key (used by "Edit" links in the review step). */
  goToStep: (key) => set((s) => {
    const visible = getVisibleStepKeys(s.formData);
    if (!visible.includes(key)) return s;
    return {
      currentStepKey: key,
      visitedSteps: s.visitedSteps.includes(key)
        ? s.visitedSteps
        : [...s.visitedSteps, key],
    };
  }),

  /** Advance to the next visible step (clamped at the last step). */
  goNext: () => set((s) => {
    const visible = getVisibleStepKeys(s.formData);
    const idx = visible.indexOf(s.currentStepKey);
    const nextKey = visible[Math.min(idx + 1, visible.length - 1)];
    return {
      currentStepKey: nextKey,
      visitedSteps: s.visitedSteps.includes(nextKey)
        ? s.visitedSteps
        : [...s.visitedSteps, nextKey],
    };
  }),

  /** Go back to the previous visible step (clamped at the first step). */
  goPrev: () => set((s) => {
    const visible = getVisibleStepKeys(s.formData);
    const idx = visible.indexOf(s.currentStepKey);
    return { currentStepKey: visible[Math.max(idx - 1, 0)] };
  }),

  /** Restore a previously saved draft (used by the resume flow, Spec C3.4). */
  hydrate: ({ formData = {}, currentStepKey = FIRST_STEP } = {}) => set({
    formData,
    currentStepKey,
    visitedSteps: [FIRST_STEP, currentStepKey].filter(
      (v, i, a) => a.indexOf(v) === i,
    ),
  }),

  /** Wipe all state (Start Fresh / post-submission cleanup). */
  reset: () => set({ currentStepKey: FIRST_STEP, formData: {}, visitedSteps: [FIRST_STEP] }),
}));

export default useFormStore;
