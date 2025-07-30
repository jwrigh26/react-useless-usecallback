import { useLayoutEffect, useMemo, useRef } from 'react';

// Generic type for any function
type AnyFunction = (...args: any[]) => any;

const debounce = <T extends AnyFunction>(
  callback: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
};

export function useDebounce<T extends AnyFunction>(
  callback: T,
  delay: number = 250
): (...args: Parameters<T>) => void {
  // Latest Ref Pattern with useLayoutEffect
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const handleDebounce = useMemo(
    () =>
      debounce((...args: Parameters<T>) => {
        callbackRef.current(...args); // Use the ref, not the original callback
      }, delay),
    [delay] // Only depend on delay
  );

  return handleDebounce;
}
