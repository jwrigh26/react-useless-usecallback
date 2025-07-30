import { useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useDebounceBroken } from "../hooks/useDebounceBroken";
import { useRenderCounter } from "../hooks/useRenderCounter";
import { CodeBlock } from "./CodeBlock";

// Mock data for fuzzy search
const MOCK_DATA = [
  "Apple iPhone 15 Pro",
  "Samsung Galaxy S24",
  "Google Pixel 8",
  "OnePlus 12",
  "Xiaomi 14 Ultra",
  "Sony Xperia 1 VI",
  "Nothing Phone (2)",
  "Fairphone 5",
  "Asus ROG Phone 8",
  "Motorola Edge 50 Pro",
  "Huawei Pura 70",
  "Realme GT 6",
  "Oppo Find X7",
  "Vivo X100 Pro",
  "Honor Magic6 Pro",
];

interface SearchDemoProps {
  title: string;
  useDebounceHook: (
    callback: (query: string) => void,
    delay: number
  ) => (query: string) => void;
  version: "broken" | "fixed";
}

function SearchDemo({ title, useDebounceHook, version }: SearchDemoProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const renderCount = useRenderCounter(`SearchDemo-${version}`);

  // This callback changes on every render in the broken version
  const searchFunction = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const filtered = MOCK_DATA.filter((item) =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setResults(filtered);
  };

  const debouncedSearch = useDebounceHook(searchFunction, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="demo-section">
      <div className="demo-title">{title}</div>

      <div className="render-counter">
        <div className="render-count">{renderCount}</div>
        <div>Renders</div>
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="Search for a phone..."
        value={query}
        onChange={handleInputChange}
      />

      {results.length > 0 && (
        <div className="search-results">
          {results.map((result, index) => (
            <div key={index} className="search-result">
              {result}
            </div>
          ))}
        </div>
      )}

      {version === "broken" && (
        <div className="performance-tip">
          <div className="performance-tip-title">⚠️ Performance Issue</div>
          <div>
            The debounced function is recreated on every render because the
            callback dependency changes. This defeats the purpose of debouncing!
          </div>
        </div>
      )}

      {version === "fixed" && (
        <div className="performance-tip">
          <div className="performance-tip-title">✅ Performance Optimized</div>
          <div>
            Using the Latest Ref Pattern, the debounced function is stable and
            only created once, while always using the latest callback.
          </div>
        </div>
      )}
    </div>
  );
}

export function DebounceExample() {
  const [activeTab, setActiveTab] = useState<"broken" | "fixed">("broken");

  const brokenCode = `import { useMemo } from 'react';

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
        callback(...args); // ❌ This breaks memoization!
      }, delay),
    [callback, delay] // ❌ callback changes every render
  );

  return handleDebounce;
}`;

  const fixedCode = `import { useLayoutEffect, useMemo, useRef } from 'react';

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
  // ✅ Latest Ref Pattern with useLayoutEffect
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const handleDebounce = useMemo(
    () =>
      debounce((...args: Parameters<T>) => {
        callbackRef.current(...args); // ✅ Always use latest
      }, delay),
    [delay] // ✅ Only depend on delay
  );

  return handleDebounce;
}`;

  const usageCode = `function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // ❌ This function changes on every render!
  const searchFunction = (searchQuery: string) => {
    const filtered = MOCK_DATA.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setResults(filtered);
  };

  // In broken version: debounced function is recreated every render
  // In fixed version: debounced function is stable
  const debouncedSearch = useDebounce(searchFunction, 300);

  return (
    <input
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}`;

  return (
    <div className="example-container">
      <div className="example-header">
        <h2 className="example-title">🔍 Debounce Hook Example</h2>
        <p className="example-description">
          This example shows how a commonly used debounce hook can be completely
          useless when the callback dependency breaks memoization on every
          render.
        </p>
      </div>

      <div className="example-tabs">
        <button
          className={`tab-button ${activeTab === "broken" ? "active" : ""}`}
          onClick={() => setActiveTab("broken")}
        >
          ❌ Broken Version
        </button>
        <button
          className={`tab-button ${activeTab === "fixed" ? "active" : ""}`}
          onClick={() => setActiveTab("fixed")}
        >
          ✅ Fixed Version
        </button>
      </div>

      <div className="example-content">
        <SearchDemo
          title={
            activeTab === "broken"
              ? "❌ Broken: useDebounceBroken"
              : "✅ Fixed: useDebounce"
          }
          useDebounceHook={
            activeTab === "broken" ? useDebounceBroken : useDebounce
          }
          version={activeTab}
        />

        <div>
          <CodeBlock
            code={activeTab === "broken" ? brokenCode : fixedCode}
            title={`${
              activeTab === "broken" ? "Broken" : "Fixed"
            } Implementation`}
            status={activeTab}
          />
        </div>
      </div>

      <CodeBlock
        code={usageCode}
        title="Consumer Code (Same for Both Versions)"
      />

      <div className="performance-tip">
        <div className="performance-tip-title">🎯 Key Learning Points</div>
        <ul>
          <li>
            <strong>Broken Version:</strong> The <code>callback</code>{" "}
            dependency changes on every render, making <code>useMemo</code>{" "}
            useless
          </li>
          <li>
            <strong>Fixed Version:</strong> Latest Ref Pattern ensures stable
            memoization while always using the latest callback
          </li>
          <li>
            <strong>Watch the render counter:</strong> Type in the search box
            and see how the broken version keeps creating new debounced
            functions
          </li>
          <li>
            <strong>Real impact:</strong> In the broken version, rapid typing
            might not be properly debounced because the function keeps changing
          </li>
        </ul>
      </div>
    </div>
  );
}
