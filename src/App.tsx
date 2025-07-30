import { useState } from "react";
import "./App.css";
import { ApiDebounceExample } from "./components/ApiDebounceExample";
import { BasicDebounceExample } from "./components/BasicDebounceExample";
import { ComparisonExample } from "./components/ComparisonExample";
import { FormDebounceExample } from "./components/FormDebounceExample";

type Section = "basic" | "form" | "api" | "comparison";

function App() {
  const [activeSection, setActiveSection] = useState<Section>("basic");

  const sections = [
    {
      id: "basic" as const,
      title: "🔍 Basic Search",
      description: "Simple search with broken debounce",
    },
    {
      id: "form" as const,
      title: "📝 Form Validation",
      description: "Form validation with cascading re-renders",
    },
    {
      id: "api" as const,
      title: "🌐 API Calls",
      description: "API debouncing gone wrong",
    },
    {
      id: "comparison" as const,
      title: "⚖️ Side-by-Side",
      description: "Broken vs Fixed comparison",
    },
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🚫 The Useless useCallback</h1>
        <p>
          Interactive examples of common memoization anti-patterns and their
          fixes
        </p>
      </header>

      <nav className="app-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`nav-button ${
              activeSection === section.id ? "active" : ""
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            <div className="nav-button-title">{section.title}</div>
            <div className="nav-button-desc">{section.description}</div>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeSection === "basic" && <BasicDebounceExample />}
        {activeSection === "form" && <FormDebounceExample />}
        {activeSection === "api" && <ApiDebounceExample />}
        {activeSection === "comparison" && <ComparisonExample />}
      </main>

      <footer className="app-footer">
        <p>
          Learn more:{" "}
          <a
            href="https://tkdodo.eu/blog/a-memo-on-react-memo"
            target="_blank"
            rel="noopener noreferrer"
          >
            "A (memo) on React.memo" by TkDodo
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
