import { useState } from "react";
import "./App.css";
import { BonusRound } from "./components/BonusRound";
import { DebounceExamples } from "./components/DebounceExamples";
import { SlideShow } from "./components/SlideShow";

type MainSection = "quiz" | "bonus" | "examples";

function App() {
  const [activeSection, setActiveSection] = useState<MainSection>("quiz");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [bonusCompleted, setBonusCompleted] = useState(false);

  const handleQuizComplete = () => {
    setQuizCompleted(true);
    // Optionally auto-navigate to examples after completing quiz
    // setActiveSection("examples");
  };

  const handleBonusComplete = () => {
    setBonusCompleted(true);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>
          🚫 <span className="gradient-text">The Useless useCallback</span>
        </h1>
        <p>
          Learn when memoization helps, when it hurts, and when it's completely
          pointless
        </p>
      </header>

      <nav className="main-nav">
        <button
          className={`main-nav-button ${
            activeSection === "quiz" ? "active" : ""
          }`}
          onClick={() => setActiveSection("quiz")}
        >
          <div className="main-nav-icon">🎯</div>
          <div className="main-nav-content">
            <div className="main-nav-title">Interactive Quiz</div>
            <div className="main-nav-desc">
              Test your memoization knowledge with real code examples
            </div>
            {quizCompleted && (
              <div className="completion-badge">✅ Completed</div>
            )}
          </div>
        </button>

        <button
          className={`main-nav-button ${
            activeSection === "examples" ? "active" : ""
          }`}
          onClick={() => setActiveSection("examples")}
        >
          <div className="main-nav-icon">🔍</div>
          <div className="main-nav-content">
            <div className="main-nav-title">Real World Examples</div>
            <div className="main-nav-desc">
              Interactive demos showing useless useCallback in practice
            </div>
          </div>
        </button>

        <button
          className={`main-nav-button ${
            activeSection === "bonus" ? "active" : ""
          }`}
          onClick={() => setActiveSection("bonus")}
        >
          <div className="main-nav-icon">👹</div>
          <div className="main-nav-content">
            <div className="main-nav-title">Bonus Round</div>
            <div className="main-nav-desc">
              Advanced traps and edge cases that will stump you
            </div>
            {bonusCompleted && (
              <div className="completion-badge">🏆 Completed</div>
            )}
          </div>
        </button>
      </nav>

      <main className="app-main">
        {activeSection === "quiz" && (
          <SlideShow onComplete={handleQuizComplete} />
        )}
        {activeSection === "bonus" && (
          <BonusRound onComplete={handleBonusComplete} />
        )}
        {activeSection === "examples" && <DebounceExamples />}
      </main>

      <footer className="app-footer">
        <p>
          Learn more:{" "}
          <a
            href="https://tkdodo.eu/blog/the-useless-use-callback"
            target="_blank"
            rel="noopener noreferrer"
          >
            "The Useless useCallback" by TkDodo
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
