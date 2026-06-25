import { useCallback, useEffect, useState } from 'react';
import { clearAllDrafts, findLatestValidDraft, mergeDraftValues } from '../utils/draftStorage.js';

/**
 * Resume-or-start-fresh flow (Spec C3.4).
 *
 * On mount, looks for the most recent valid encrypted draft. If found, exposes
 * it so the wizard can show a resume modal. `resume()` restores the form (and
 * step via onResume); `startFresh()` purges all drafts.
 *
 * @param {Object} params
 * @param {(values: Record<string, unknown>) => void} params.reset  RHF reset.
 * @param {(stepKey: string) => void} [params.onResume]  Restore navigation.
 */
export function useFormPersistence({ reset, onResume }) {
  const [draft, setDraft] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    findLatestValidDraft().then((found) => {
      if (active) {
        setDraft(found);
        setChecked(true);
      }
    });
    return () => { active = false; };
  }, []);

  const resume = useCallback(() => {
    if (draft?.values) {
      reset(mergeDraftValues(draft.values));
      if (onResume) onResume(draft.step);
    }
    setDraft(null);
  }, [draft, reset, onResume]);

  const startFresh = useCallback(() => {
    clearAllDrafts();
    setDraft(null);
  }, []);

  return {
    draft, hasDraft: Boolean(draft), checked, resume, startFresh,
  };
}

export default useFormPersistence;
