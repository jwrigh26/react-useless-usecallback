import { useState } from "react";
import { CodeBlock } from "./CodeBlock";

interface Slide {
  id: number;
  title: string;
  code: string;
  question: string;
  answer: string;
  explanation: string;
  isCorrect: boolean;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "The Classic Mistake",
    code: `function Meh() {
  return (
    <MemoizedComponent
      value={{ hello: 'world' }}
      onChange={(result) => console.log('result')}
    />
  )
}`,
    question:
      "Will this component cause unnecessary re-renders of MemoizedComponent?",
    answer: "YES - Creates new objects every render",
    explanation:
      "Every render creates a new object literal and arrow function, causing MemoizedComponent to re-render even if it's wrapped in React.memo.",
    isCorrect: false,
  },
  {
    id: 2,
    title: "The 'Fixed' Version",
    code: `function Okay() {
  const value = useMemo(() => ({ hello: 'world' }), [])
  const onChange = useCallback((result) => console.log(result), [])

  return <MemoizedComponent value={value} onChange={onChange} />
}`,
    question: "Is this properly optimized now?",
    answer: "YES - Stable references prevent unnecessary re-renders",
    explanation:
      "useMemo and useCallback create stable references that don't change between renders, so MemoizedComponent won't re-render unnecessarily.",
    isCorrect: true,
  },
  {
    id: 3,
    title: "Spot the Problem",
    code: `function Okay() {
  const value = useMemo(() => ({ hello: 'world' }), [])
  const onChange = useCallback((result) => console.log(result), [])

  return <Component value={value} onChange={onChange} />
}`,
    question: "Can you spot the difference? Is the memoization still useful?",
    answer: "NO - Component is not memoized!",
    explanation:
      "We're passing memoized values to a regular component (not MemoizedComponent). Since Component isn't wrapped in React.memo, it will re-render anyway, making our memoization completely useless.",
    isCorrect: false,
  },
  {
    id: 4,
    title: "The DOM Element Trap",
    code: `function MyButton() {
  const onClick = useCallback(
    (event) => console.log(event.currentTarget.value),
    []
  )

  return <button onClick={onClick} />
}`,
    question: "Is useCallback providing any benefit here?",
    answer: "NO - Native DOM elements don't benefit from memoization",
    explanation:
      "The <button> is a native DOM element, not a React component. Native elements don't have render cycles to optimize, so useCallback provides zero benefit.",
    isCorrect: false,
  },
  {
    id: 5,
    title: "Complex Props Object",
    code: `function UserProfile({ user }) {
  const profileData = useMemo(() => ({
    name: user.name,
    avatar: user.avatar,
    isOnline: user.status === 'online'
  }), [user.name, user.avatar, user.status])

  return <div className="profile">{profileData.name}</div>
}`,
    question: "Is this useMemo helping performance?",
    answer: "NO - Not passing to memoized component",
    explanation:
      "We're creating a memoized object but only using it locally in a <div>. Since we're not passing it as props to a memoized component, the useMemo is just adding overhead.",
    isCorrect: false,
  },
  {
    id: 6,
    title: "Event Handler with Dependencies",
    code: `function SearchBox({ onSearch, placeholder }) {
  const [query, setQuery] = useState('')
  
  const handleSearch = useCallback(() => {
    onSearch(query)
  }, [onSearch, query])

  return <input onChange={(e) => setQuery(e.target.value)} onBlur={handleSearch} />
}`,
    question: "Is this useCallback effective?",
    answer: "NO - Dependencies change frequently",
    explanation:
      "The handleSearch function depends on 'query' which changes on every keystroke. This makes useCallback recreate the function constantly, providing no benefit while adding overhead.",
    isCorrect: false,
  },
  {
    id: 7,
    title: "The Right Way",
    code: `const MemoizedExpensiveComponent = React.memo(ExpensiveComponent)

function Parent() {
  const stableValue = useMemo(() => ({ type: 'user' }), [])
  const stableCallback = useCallback((id) => deleteUser(id), [])

  return (
    <MemoizedExpensiveComponent 
      config={stableValue}
      onDelete={stableCallback}
    />
  )
}`,
    question: "Is this memoization worthwhile?",
    answer: "YES - All conditions are met!",
    explanation:
      "✅ Component is memoized with React.memo ✅ Props are memoized with stable references ✅ No frequently changing dependencies. This prevents unnecessary re-renders of ExpensiveComponent.",
    isCorrect: true,
  },
];

interface SlideShowProps {
  onComplete: () => void;
}

export function SlideShow({ onComplete }: SlideShowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  const handleAnswer = (answer: boolean) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentSlide] = answer;
    setUserAnswers(newAnswers);
    setShowAnswer(true);
  };

  const nextSlide = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setShowAnswer(userAnswers[currentSlide - 1] !== undefined);
    }
  };

  const resetQuiz = () => {
    setCurrentSlide(0);
    setShowAnswer(false);
    setUserAnswers([]);
  };

  const correctAnswers = userAnswers.filter(
    (answer, index) => answer === slides[index].isCorrect
  ).length;

  return (
    <div className="slideshow-container">
      <div className="slideshow-header">
        <h2>🎯 Memoization Quiz</h2>
        <div className="slide-counter">
          Slide {currentSlide + 1} of {slides.length}
        </div>
      </div>

      <div className="slide-progress">
        <div
          className="slide-progress-bar"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      <div className="slide-content">
        <h3 className="slide-title">{slide.title}</h3>

        <CodeBlock code={slide.code} title="Code Example" />

        <div className="slide-question">
          <h4>🤔 {slide.question}</h4>

          {!showAnswer ? (
            <div className="answer-buttons">
              <button
                className="answer-btn answer-btn-yes"
                onClick={() => handleAnswer(true)}
              >
                ✅ YES
              </button>
              <button
                className="answer-btn answer-btn-no"
                onClick={() => handleAnswer(false)}
              >
                ❌ NO
              </button>
            </div>
          ) : (
            <div className="answer-reveal">
              <div
                className={`answer-result ${
                  userAnswers[currentSlide] === slide.isCorrect
                    ? "correct"
                    : "incorrect"
                }`}
              >
                <div className="answer-text">
                  <strong>Answer:</strong> {slide.answer}
                </div>
                {userAnswers[currentSlide] === slide.isCorrect ? (
                  <div className="result-icon">🎉</div>
                ) : (
                  <div className="result-icon">😅</div>
                )}
              </div>

              <div className="explanation">
                <strong>Explanation:</strong> {slide.explanation}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="slide-navigation">
        <button
          className="nav-btn"
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          ← Previous
        </button>

        <div className="slide-dots">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`slide-dot ${index === currentSlide ? "active" : ""} ${
                userAnswers[index] !== undefined ? "completed" : ""
              }`}
              onClick={() => {
                setCurrentSlide(index);
                setShowAnswer(userAnswers[index] !== undefined);
              }}
            />
          ))}
        </div>

        {showAnswer && (
          <button className="nav-btn nav-btn-primary" onClick={nextSlide}>
            {isLastSlide ? "Finish Quiz" : "Next →"}
          </button>
        )}
      </div>

      {isLastSlide && showAnswer && (
        <div className="quiz-summary">
          <h4>🎯 Quiz Complete!</h4>
          <p>
            You got <strong>{correctAnswers}</strong> out of{" "}
            <strong>{slides.length}</strong> correct!
          </p>
          <button className="reset-btn" onClick={resetQuiz}>
            🔄 Take Quiz Again
          </button>
        </div>
      )}
    </div>
  );
}
