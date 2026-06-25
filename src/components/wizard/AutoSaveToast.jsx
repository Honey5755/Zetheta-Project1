import { useEffect, useState } from 'react';

/**
 * Subtle "Draft saved at [time]" toast that auto-dismisses after 2s (Spec C3.4).
 * @param {Object} props
 * @param {Date | null} props.savedAt
 */
function AutoSaveToast({ savedAt }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!savedAt) return undefined;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [savedAt]);

  if (!visible || !savedAt) return null;
  const time = savedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg"
    >
      {`Draft saved at ${time}`}
    </div>
  );
}

export default AutoSaveToast;
