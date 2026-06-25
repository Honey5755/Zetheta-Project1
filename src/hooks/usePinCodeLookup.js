import { useEffect, useState } from 'react';
import pinCodeData from '../utils/pinCodeData.json';

const EMPTY = {
  city: '', state: '', postOffice: '', isLoading: false, error: null,
};

/**
 * Look up an Indian PIN code against the bundled dataset, simulating the
 * latency of the India Post API (Spec A3.3). Returns the derived city/state/
 * post office plus loading and error state. Resolution is debounced via a
 * short timeout and cancelled if the PIN changes.
 *
 * @param {string} pin  the 6-digit PIN code
 * @returns {{ city: string, state: string, postOffice: string,
 *   isLoading: boolean, error: string|null }}
 */
export function usePinCodeLookup(pin) {
  const [result, setResult] = useState(EMPTY);

  useEffect(() => {
    if (!/^\d{6}$/.test(pin || '')) {
      setResult(EMPTY);
      return undefined;
    }
    setResult((prev) => ({ ...prev, isLoading: true, error: null }));
    const timer = setTimeout(() => {
      const entry = pinCodeData[pin];
      if (entry) {
        setResult({
          city: entry.city,
          state: entry.state,
          postOffice: entry.postOffice,
          isLoading: false,
          error: null,
        });
      } else {
        setResult({
          ...EMPTY,
          error: 'PIN code not found. Please check and enter your city/state manually.',
        });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [pin]);

  return result;
}

export default usePinCodeLookup;
