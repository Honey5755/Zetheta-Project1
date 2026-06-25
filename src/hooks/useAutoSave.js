import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { saveDraft } from '../utils/draftStorage.js';

/**
 * Debounced encrypted auto-save (Spec C3.4).
 *
 * Subscribes to React Hook Form changes; each change resets a timer, and when
 * it fires (default 30s of quiet) the form is serialised, encrypted and written
 * to LocalStorage. Returns the last-saved timestamp (for a toast) and a
 * `saveNow` for the manual "Save Draft" button.
 *
 * @param {Object} params
 * @param {Function} params.watch       RHF watch (subscribe form).
 * @param {Function} params.getValues   RHF getValues.
 * @param {() => string} params.getStepKey  Current step key.
 * @param {number} [params.interval]    Debounce interval in ms (default 30000).
 */
export function useAutoSave({
  watch, getValues, getStepKey, interval = 30000,
}) {
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const timerRef = useRef(null);

  const persist = useCallback(async () => {
    const ok = await saveDraft(getValues(), getStepKey());
    if (ok) setLastSavedAt(new Date());
    return ok;
  }, [getValues, getStepKey]);

  useEffect(() => {
    const subscription = watch(() => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(persist, interval);
    });
    return () => {
      subscription.unsubscribe();
      clearTimeout(timerRef.current);
    };
  }, [watch, persist, interval]);

  return { lastSavedAt, saveNow: persist };
}

export default useAutoSave;
