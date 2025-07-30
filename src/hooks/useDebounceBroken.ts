import { useMemo } from "react";

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

export function useDebounceBroken<T extends AnyFunction>(
  callback: T,
  delay: number = 250
): (...args: Parameters<T>) => void {
  const handleDebounce = useMemo(
    () =>
      debounce((...args: Parameters<T>) => {
        callback(...args); // This breaks memoization!
      }, delay),
    [callback, delay] // callback changes every render
  );

  return handleDebounce;
}
