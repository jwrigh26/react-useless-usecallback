import { useState } from "react";
import { ApiDebounceExample } from "./ApiDebounceExample";
import { BasicDebounceExample } from "./BasicDebounceExample";
import { ComparisonExample } from "./ComparisonExample";
import { FormDebounceExample } from "./FormDebounceExample";

type Section = "basic" | "form" | "api" | "comparison";

export function DebounceExamples() {
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
    <div className="examples-container">
      <div className="examples-header">
        <h2>🚫 The Useless useCallback - Real World Examples</h2>
        <p>
          Practical examples showing how broken debounce hooks demonstrate the
          useless useCallback anti-pattern in real applications.
        </p>
      </div>

      <nav className="examples-nav">
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

      <main className="examples-main">
        {activeSection === "basic" && <BasicDebounceExample />}
        {activeSection === "form" && <FormDebounceExample />}
        {activeSection === "api" && <ApiDebounceExample />}
        {activeSection === "comparison" && <ComparisonExample />}
      </main>
    </div>
  );
}
