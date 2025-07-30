import { useRef } from "react";

export function useRenderCounter(name: string) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Only log in dev mode (Vite sets import.meta.env.DEV)
  if (import.meta.env.DEV) {
    console.log(`${name} rendered ${renderCount.current} times`);
  }

  return renderCount.current;
}
