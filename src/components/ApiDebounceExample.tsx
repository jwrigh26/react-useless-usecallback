import { useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useDebounceBroken } from "../hooks/useDebounceBroken";
import { useRenderCounter } from "../hooks/useRenderCounter";
import { CodeBlock } from "./CodeBlock";

interface SearchResult {
  id: number;
  title: string;
  description: string;
  type: "user" | "repository" | "issue";
}

// Mock API that simulates search results
const mockSearchAPI = (query: string): Promise<SearchResult[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query.trim()) {
        resolve([]);
        return;
      }

      const mockResults: SearchResult[] = [
        {
          id: 1,
          title: `${query} User Profile`,
          description: "A user matching your search",
          type: "user",
        },
        {
          id: 2,
          title: `${query} Repository`,
          description: "A repository with related code",
          type: "repository",
        },
        {
          id: 3,
          title: `${query} Issue #123`,
          description: "An issue discussing this topic",
          type: "issue",
        },
        {
          id: 4,
          title: `${query} Documentation`,
          description: "Official docs for this topic",
          type: "repository",
        },
        {
          id: 5,
          title: `Another ${query} Result`,
          description: "More relevant search results",
          type: "user",
        },
      ];

      // Simulate some randomness in results
      const numResults = Math.floor(Math.random() * 5) + 1;
      resolve(mockResults.slice(0, numResults));
    }, 300 + Math.random() * 200); // Variable delay to simulate real API
  });
};

interface ApiDemoProps {
  title: string;
  version: "broken" | "fixed";
}

function ApiDemo({ title, version }: ApiDemoProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const renderCount = useRenderCounter(`ApiDemo-${version}`);

  // This search function changes on every render in the broken version
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setRequestCount((prev) => prev + 1);

    try {
      const searchResults = await mockSearchAPI(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Always call both hooks to avoid Rules of Hooks violations
  const debouncedSearchBroken = useDebounceBroken(performSearch, 500);
  const debouncedSearchFixed = useDebounce(performSearch, 500);

  // Select which debounced function to use based on version
  const debouncedSearch =
    version === "broken" ? debouncedSearchBroken : debouncedSearchFixed;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setError(null);
    setLoading(false);
  };

  const getTypeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "user":
        return "👤";
      case "repository":
        return "📁";
      case "issue":
        return "🐛";
      default:
        return "📄";
    }
  };

  return (
    <div className="demo-section">
      <div className="demo-title">{title}</div>

      <div className="render-counter">
        <div className="render-count">{renderCount}</div>
        <div>Renders</div>
      </div>

      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span style={{ fontSize: "0.9rem", color: "#888" }}>API Requests:</span>
        <span style={{ fontWeight: "bold", color: "#646cff" }}>
          {requestCount}
        </span>
        <button
          onClick={() => setRequestCount(0)}
          style={{
            padding: "0.25rem 0.5rem",
            fontSize: "0.8rem",
            background: "#333",
            border: "none",
            borderRadius: "4px",
            color: "white",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search for users, repos, issues..."
          value={query}
          onChange={handleInputChange}
          style={{ flex: 1, margin: 0 }}
        />
        <button onClick={clearSearch} style={{ padding: "0.75rem 1rem" }}>
          Clear
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", color: "#646cff", padding: "1rem" }}>
          🔍 Searching...
        </div>
      )}

      {error && (
        <div
          style={{
            background: "rgba(255, 107, 107, 0.1)",
            border: "1px solid rgba(255, 107, 107, 0.3)",
            borderRadius: "8px",
            padding: "1rem",
            color: "#ff6b6b",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="search-results" style={{ maxHeight: "300px" }}>
          {results.map((result) => (
            <div
              key={result.id}
              className="search-result"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>
                {getTypeIcon(result.type)}
              </span>
              <div>
                <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                  {result.title}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#888" }}>
                  {result.description}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#646cff",
                    textTransform: "uppercase",
                    marginTop: "0.25rem",
                  }}
                >
                  {result.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {version === "broken" && (
        <div className="performance-tip">
          <div className="performance-tip-title">⚠️ API Request Issues</div>
          <div>
            The debounced function is recreated on every render, which can lead
            to:
            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
              <li>More API requests than necessary</li>
              <li>Inconsistent debounce timing</li>
              <li>Potential race conditions</li>
            </ul>
          </div>
        </div>
      )}

      {version === "fixed" && (
        <div className="performance-tip">
          <div className="performance-tip-title">✅ Optimized API Calls</div>
          <div>
            The debounced function is stable, ensuring:
            <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
              <li>Consistent 500ms debounce timing</li>
              <li>Fewer unnecessary API requests</li>
              <li>Predictable search behavior</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApiDebounceExample() {
  const [activeTab, setActiveTab] = useState<"broken" | "fixed">("broken");

  const brokenApiCode = `function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ❌ This function depends on state that changes frequently
  const performSearch = async (searchQuery: string) => {
    setLoading(true); // State dependency!
    
    try {
      const data = await fetch(\`/api/search?q=\${searchQuery}\`);
      const results = await data.json();
      setResults(results); // State dependency!
    } finally {
      setLoading(false); // State dependency!
    }
  };

  // ❌ Recreated every render due to performSearch changing
  const debouncedSearch = useDebounceBroken(performSearch, 500);

  return (
    <input
      onChange={(e) => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value); // Unpredictable timing!
      }}
    />
  );
}`;

  const fixedApiCode = `function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Uses functional updates - no problematic dependencies
  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    
    try {
      const data = await fetch(\`/api/search?q=\${searchQuery}\`);
      const results = await data.json();
      setResults(results);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Stable debounced function thanks to Latest Ref Pattern
  const debouncedSearch = useDebounce(performSearch, 500);

  return (
    <input
      onChange={(e) => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value); // Consistent 500ms debounce!
      }}
    />
  );
}`;

  return (
    <div className="example-container">
      <div className="example-header">
        <h2 className="example-title">🌐 API Search with Debounce</h2>
        <p className="example-description">
          This example demonstrates how broken debouncing can lead to excessive
          API calls and unpredictable search behavior. Watch the API request
          counter to see the difference.
        </p>
      </div>

      <div className="example-tabs">
        <button
          className={`tab-button ${activeTab === "broken" ? "active" : ""}`}
          onClick={() => setActiveTab("broken")}
        >
          ❌ Broken API Calls
        </button>
        <button
          className={`tab-button ${activeTab === "fixed" ? "active" : ""}`}
          onClick={() => setActiveTab("fixed")}
        >
          ✅ Fixed API Calls
        </button>
      </div>

      <div className="example-content">
        <ApiDemo
          title={
            activeTab === "broken"
              ? "❌ Broken: Excessive API Requests"
              : "✅ Fixed: Optimized API Calls"
          }
          version={activeTab}
        />

        <div>
          <CodeBlock
            code={activeTab === "broken" ? brokenApiCode : fixedApiCode}
            title={`${
              activeTab === "broken" ? "Broken" : "Fixed"
            } API Implementation`}
            status={activeTab}
          />
        </div>
      </div>

      <div className="performance-tip">
        <div className="performance-tip-title">🎯 Key Observations</div>
        <ul>
          <li>
            <strong>API Request Count:</strong> Type rapidly and watch how many
            requests are made
          </li>
          <li>
            <strong>Debounce Timing:</strong> In the broken version, debouncing
            might not work as expected
          </li>
          <li>
            <strong>User Experience:</strong> Fixed version provides more
            predictable search behavior
          </li>
          <li>
            <strong>Network Impact:</strong> Fewer unnecessary requests = better
            performance and lower costs
          </li>
        </ul>
      </div>
    </div>
  );
}
