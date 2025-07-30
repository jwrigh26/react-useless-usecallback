import { useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useDebounceBroken } from "../hooks/useDebounceBroken";
import { useRenderCounter } from "../hooks/useRenderCounter";
import { CodeBlock } from "./CodeBlock";

const SAMPLE_DATA = [
  "React hooks best practices",
  "TypeScript advanced types",
  "JavaScript performance optimization",
  "CSS Grid layout techniques",
  "Node.js backend development",
  "GraphQL query optimization",
  "Database indexing strategies",
  "API design principles",
  "Testing strategies for React",
  "State management patterns",
  "Component composition techniques",
  "Performance monitoring tools",
  "Web accessibility guidelines",
  "Progressive Web Apps",
  "Server-side rendering benefits",
];

interface SideBySideDemoProps {
  title: string;
  useDebounceHook: (
    callback: (query: string) => void,
    delay: number
  ) => (query: string) => void;
  version: "broken" | "fixed";
}

function SideBySideDemo({
  title,
  useDebounceHook,
  version,
}: SideBySideDemoProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [searchCount, setSearchCount] = useState(0);
  const renderCount = useRenderCounter(`SideBySideDemo-${version}`);

  // This function changes on every render in the broken version
  const performSearch = (searchQuery: string) => {
    setSearchCount((prev) => prev + 1);

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const filtered = SAMPLE_DATA.filter((item) =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setResults(filtered);
  };

  const debouncedSearch = useDebounceHook(performSearch, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const resetCounters = () => {
    setSearchCount(0);
  };

  return (
    <div
      style={{
        background: "#252525",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "1.5rem",
        height: "500px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          paddingBottom: "0.5rem",
          borderBottom: "1px solid #333",
        }}
      >
        <div style={{ fontWeight: "600", fontSize: "1.1rem" }}>{title}</div>
        <div className={`status-indicator status-${version}`}>
          {version === "broken" ? "❌ Broken" : "✅ Fixed"}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          fontSize: "0.9rem",
        }}
      >
        <div
          style={{
            background: "rgba(255, 107, 107, 0.1)",
            border: "1px solid rgba(255, 107, 107, 0.3)",
            borderRadius: "6px",
            padding: "0.5rem",
            textAlign: "center",
            flex: 1,
          }}
        >
          <div
            style={{ color: "#ff6b6b", fontWeight: "bold", fontSize: "1.2rem" }}
          >
            {renderCount}
          </div>
          <div style={{ color: "#ff6b6b" }}>Renders</div>
        </div>

        <div
          style={{
            background: "rgba(100, 108, 255, 0.1)",
            border: "1px solid rgba(100, 108, 255, 0.3)",
            borderRadius: "6px",
            padding: "0.5rem",
            textAlign: "center",
            flex: 1,
          }}
        >
          <div
            style={{ color: "#646cff", fontWeight: "bold", fontSize: "1.2rem" }}
          >
            {searchCount}
          </div>
          <div style={{ color: "#646cff" }}>Searches</div>
        </div>

        <button
          onClick={resetCounters}
          style={{
            padding: "0.5rem",
            background: "#333",
            border: "none",
            borderRadius: "4px",
            color: "white",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          Reset
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={`Search in ${version} version...`}
        style={{
          width: "100%",
          padding: "0.75rem",
          border: "2px solid #333",
          borderRadius: "8px",
          background: "#1a1a1a",
          color: "white",
          fontSize: "1rem",
          marginBottom: "1rem",
        }}
      />

      <div
        style={{
          flex: 1,
          overflow: "auto",
          border: "1px solid #333",
          borderRadius: "8px",
          background: "#1a1a1a",
        }}
      >
        {results.length > 0 ? (
          results.map((result, index) => (
            <div
              key={index}
              style={{
                padding: "0.75rem",
                borderBottom:
                  index < results.length - 1 ? "1px solid #333" : "none",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {result}
            </div>
          ))
        ) : query ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#888",
              fontStyle: "italic",
            }}
          >
            No results found for "{query}"
          </div>
        ) : (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#888",
              fontStyle: "italic",
            }}
          >
            Start typing to search...
          </div>
        )}
      </div>
    </div>
  );
}

export function ComparisonExample() {
  const brokenImplementation = `// ❌ BROKEN VERSION
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
}

// Consumer code
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // ❌ This function changes on every render
  const performSearch = (searchQuery) => {
    // Uses state setters - creates new function identity
    const filtered = DATA.filter(item => 
      item.includes(searchQuery)
    );
    setResults(filtered);
  };

  // ❌ debouncedSearch is recreated every render!
  const debouncedSearch = useDebounceBroken(performSearch, 300);

  return (
    <input
      onChange={(e) => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value); // Inconsistent timing!
      }}
    />
  );
}`;

  const fixedImplementation = `// ✅ FIXED VERSION  
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
}

// Consumer code (same as broken version)
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // ✅ This function still changes, but that's OK!
  const performSearch = (searchQuery) => {
    const filtered = DATA.filter(item => 
      item.includes(searchQuery)
    );
    setResults(filtered);
  };

  // ✅ debouncedSearch is stable thanks to Latest Ref Pattern
  const debouncedSearch = useDebounce(performSearch, 300);

  return (
    <input
      onChange={(e) => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value); // Consistent 300ms debounce!
      }}
    />
  );
}`;

  return (
    <div className="example-container">
      <div className="example-header">
        <h2 className="example-title">⚖️ Side-by-Side Comparison</h2>
        <p className="example-description">
          Compare the broken and fixed versions directly. Type the same text in
          both search boxes and observe the differences in render counts and
          search behavior.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        <SideBySideDemo
          title="❌ Broken useDebounce"
          useDebounceHook={useDebounceBroken}
          version="broken"
        />

        <SideBySideDemo
          title="✅ Fixed useDebounce"
          useDebounceHook={useDebounce}
          version="fixed"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        <CodeBlock
          code={brokenImplementation}
          title="❌ Broken Implementation"
          status="broken"
        />

        <CodeBlock
          code={fixedImplementation}
          title="✅ Fixed Implementation"
          status="fixed"
        />
      </div>

      <div className="performance-tip">
        <div className="performance-tip-title">🎯 What to Notice</div>
        <ul>
          <li>
            <strong>Render Counts:</strong> Both versions re-render the same
            amount (this is expected and normal)
          </li>
          <li>
            <strong>Search Counts:</strong> The broken version might perform
            more searches due to inconsistent debouncing
          </li>
          <li>
            <strong>Typing Feel:</strong> Try typing rapidly - the fixed version
            should feel more responsive and predictable
          </li>
          <li>
            <strong>Memory Usage:</strong> The broken version creates new
            debounced functions constantly (not visible but happening)
          </li>
          <li>
            <strong>Real Impact:</strong> In complex apps, this pattern can
            cause significant performance issues
          </li>
        </ul>
      </div>

      <div
        style={{
          background: "rgba(100, 108, 255, 0.1)",
          border: "1px solid rgba(100, 108, 255, 0.3)",
          borderRadius: "8px",
          padding: "1.5rem",
        }}
      >
        <div
          style={{ fontWeight: "600", marginBottom: "1rem", color: "#646cff" }}
        >
          💡 The Key Insight
        </div>
        <p style={{ margin: 0, lineHeight: "1.6" }}>
          The problem isn't with <code>useCallback</code> or{" "}
          <code>useMemo</code> themselves - they're useful tools. The problem is
          using them with dependencies that change frequently, making the
          memoization completely useless. The Latest Ref Pattern solves this by
          keeping the memoization stable while always accessing the latest
          values.
        </p>
      </div>
    </div>
  );
}
