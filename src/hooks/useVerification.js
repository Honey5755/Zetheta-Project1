import {
  useCallback, useEffect, useRef, useState,
} from 'react';

/**
 * Simulated PAN/Aadhaar verification (Spec A3.2, Day 4).
 *
 * `verify(value, validate)` runs a synchronous format/business check; on success
 * it shows a "verifying" state for 1.5s (mimicking an NSDL/UIDAI API round-trip)
 * before settling on "verified". On a format failure it reports the error
 * immediately. `reset()` returns to idle (call this whenever the value changes
 * so prior verification doesn't leak onto edited input).
 *
 * @returns {{
 *   status: 'idle'|'verifying'|'verified'|'error',
 *   error: string|null,
 *   isVerifying: boolean,
 *   isVerified: boolean,
 *   verify: (value: string, validate: (v: string) => { valid: boolean, message?: string }) => void,
 *   reset: () => void,
 * }}
 */
export function useVerification() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const verify = useCallback((value, validate) => {
    clearTimeout(timerRef.current);
    const result = validate(value);
    if (!result.valid) {
      setStatus('error');
      setError(result.message || 'Verification failed.');
      return;
    }
    setError(null);
    setStatus('verifying');
    timerRef.current = setTimeout(() => setStatus('verified'), 1500);
  }, []);

  const reset = useCallback(() => {
    clearTimeout(timerRef.current);
    setStatus('idle');
    setError(null);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return {
    status,
    error,
    isVerifying: status === 'verifying',
    isVerified: status === 'verified',
    verify,
    reset,
  };
}

export default useVerification;
