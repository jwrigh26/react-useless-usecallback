import { useState } from "react";
import { CodeBlock } from "./CodeBlock";

interface BonusSlide {
  id: number;
  title: string;
  code: string;
  question: string;
  answer: string;
  explanation: string;
  isCorrect: boolean;
  difficulty: "Hard" | "Expert" | "Nightmare";
}

const bonusSlides: BonusSlide[] = [
  {
    id: 1,
    title: "The Two-Layer Deep Trap",
    difficulty: "Hard",
    code: `const MemoizedChild = React.memo(Child)
const MemoizedGrandchild = React.memo(Grandchild)

function Parent() {
  const [count, setCount] = useState(0)
  const stableConfig = useMemo(() => ({ theme: 'dark' }), [])
  const stableCallback = useCallback((id) => console.log(id), [])
  
  // This looks innocent enough...
  const items = ['item1', 'item2', 'item3']
  
  return (
    <MemoizedChild 
      config={stableConfig}
      onAction={stableCallback}
      items={items}
    />
  )
}

function Child({ config, onAction, items }) {
  return (
    <MemoizedGrandchild 
      config={config}
      onAction={onAction}
      items={items}
    />
  )
}`,
    question: "Will MemoizedGrandchild re-render unnecessarily?",
    answer: "YES - The items array is recreated every render",
    explanation:
      "Even though config and onAction are stable, the items array literal is created fresh on every Parent render. This breaks memoization all the way down the component tree, causing both MemoizedChild AND MemoizedGrandchild to re-render.",
    isCorrect: true,
  },
  {
    id: 2,
    title: "The Sneaky Object Spread",
    difficulty: "Expert",
    code: `const MemoizedComponent = React.memo(Component)

function Parent({ user, theme }) {
  const baseConfig = useMemo(() => ({ 
    apiUrl: '/api/v1',
    timeout: 5000 
  }), [])
  
  const config = useMemo(() => ({
    ...baseConfig,
    theme,
    userId: user.id
  }), [baseConfig, theme, user.id])
  
  return <MemoizedComponent config={config} />
}`,
    question: "Is this memoization working correctly?",
    answer: "NO - Multiple issues: spread + unstable user.id dependency",
    explanation:
      "This has TWO problems: 1) The spread operator (...baseConfig) creates a new object every render, making memoization useless. 2) Even if we fixed the spread, user.id is dangerous because 'user' often comes from Redux/Context as a new object each render. React compares dependencies by reference, so even if user.id has the same VALUE (like 123), if 'user' is a new object, the dependency check fails. Better approach: extract const userId = user.id first, then use userId in dependencies.",
    isCorrect: false,
  },
  {
    id: 3,
    title: "The Context Provider Killer",
    difficulty: "Expert",
    code: `const MemoizedExpensiveList = React.memo(ExpensiveList)

function App() {
  const [user, setUser] = useState({ name: 'John', id: 1 })
  const [theme, setTheme] = useState('dark')
  
  const contextValue = useMemo(() => ({
    user,
    theme,
    updateTheme: (newTheme) => setTheme(newTheme)
  }), [user, theme])
  
  return (
    <UserContext.Provider value={contextValue}>
      <MemoizedExpensiveList />
    </UserContext.Provider>
  )
}

function ExpensiveList() {
  const { theme } = useContext(UserContext)
  return <div>Expensive rendering with {theme} theme</div>
}`,
    question:
      "Will MemoizedExpensiveList be protected from unnecessary re-renders?",
    answer: "NO - Context changes bypass React.memo completely",
    explanation:
      "React.memo only checks props, but ExpensiveList consumes context directly. When contextValue changes (which happens whenever user or theme changes), ALL context consumers re-render regardless of React.memo. The memoization is completely bypassed.",
    isCorrect: false,
  },
  {
    id: 4,
    title: "The Custom Hook Dependency Hell",
    difficulty: "Nightmare",
    code: `function useApiCall(endpoint, options) {
  const memoizedOptions = useMemo(() => options, [options])
  
  return useQuery([endpoint, memoizedOptions], () => 
    fetch(endpoint, memoizedOptions)
  )
}

function Component({ userId, filters }) {
  const apiOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...filters })
  }
  
  const { data } = useApiCall('/api/users', apiOptions)
  
  return <div>{data?.length} users found</div>
}`,
    question:
      "Will the API call be properly memoized to avoid unnecessary requests?",
    answer: "NO - apiOptions object is recreated on every render",
    explanation:
      "The useMemo inside useApiCall is useless because 'options' (apiOptions) is a new object on every render. The memoization breaks immediately, causing useQuery to see a 'new' key every time and triggering constant API calls. This is a common mistake when extracting custom hooks.",
    isCorrect: false,
  },
  {
    id: 5,
    title: "The Array Method Trap",
    difficulty: "Hard",
    code: `const MemoizedUserList = React.memo(UserList)

function Dashboard({ users, searchTerm }) {
  const filteredUsers = useMemo(() => 
    users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]
  )
  
  const userIds = useMemo(() => 
    filteredUsers.map(user => user.id), 
    [filteredUsers]
  )
  
  return <MemoizedUserList users={filteredUsers} selectedIds={userIds} />
}`,
    question: "Are both useMemo calls providing performance benefits?",
    answer: "Partially - filteredUsers is good, but userIds is questionable",
    explanation:
      "The first useMemo (filteredUsers) is beneficial if users/searchTerm are stable. However, the second useMemo (userIds) depends on filteredUsers, which is an array. Arrays are compared by reference, so even if the actual user IDs haven't changed, filteredUsers being 'new' will cause userIds to recalculate anyway.",
    isCorrect: false,
  },
  {
    id: 6,
    title: "The Ref Forwarding Illusion",
    difficulty: "Expert",
    code: `const MemoizedInput = React.memo(React.forwardRef((props, ref) => {
  return <input ref={ref} {...props} />
}))

function Form() {
  const [value, setValue] = useState('')
  const inputRef = useRef()
  
  const handleSubmit = useCallback(() => {
    console.log('Submitting:', value)
    inputRef.current?.focus()
  }, [value])
  
  return (
    <form onSubmit={handleSubmit}>
      <MemoizedInput 
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  )
}`,
    question: "Will MemoizedInput re-render unnecessarily?",
    answer: "YES - onChange creates a new function every render",
    explanation:
      "While the ref is stable, the onChange prop is a new arrow function on every render. Even though MemoizedInput is memoized, it will re-render every time because onChange is always 'different'. The handleSubmit useCallback is also recreating due to the value dependency.",
    isCorrect: true,
  },
  {
    id: 7,
    title: "The Perfect Storm",
    difficulty: "Nightmare",
    code: `const ExpensiveChild = React.memo(({ config, onUpdate, children }) => {
  console.log('ExpensiveChild rendered')
  return <div onClick={onUpdate}>{children}</div>
})

function Parent() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('John')
  
  const config = useMemo(() => ({ 
    theme: 'dark',
    version: '1.0.0' 
  }), [])
  
  const handleUpdate = useCallback(() => {
    setCount(c => c + 1)
  }, [])
  
  const childElement = useMemo(() => (
    <span>Hello {name}!</span>
  ), [name])
  
  return (
    <ExpensiveChild 
      config={config}
      onUpdate={handleUpdate}
      children={childElement}
    />
  )
}`,
    question: "Is this the perfect memoization setup?",
    answer: "YES - All props are properly memoized",
    explanation:
      "🎉 This is actually correct! config is stable (no dependencies), handleUpdate is stable (using functional state update), and children is memoized with proper dependencies. ExpensiveChild will only re-render when name changes, which is exactly what we want. This demonstrates the RIGHT way to do deep memoization.",
    isCorrect: true,
  },
  {
    id: 8,
    title: "The Higher-Order Component Nightmare",
    difficulty: "Nightmare",
    code: `const withLoading = (WrappedComponent) => {
  return React.memo((props) => {
    if (props.loading) return <div>Loading...</div>
    return <WrappedComponent {...props} />
  })
}

const EnhancedComponent = withLoading(ExpensiveComponent)

function Parent({ data }) {
  const [loading, setLoading] = useState(false)
  
  const processedData = useMemo(() => ({
    items: data.map(item => ({ ...item, processed: true })),
    count: data.length
  }), [data])
  
  return (
    <EnhancedComponent 
      loading={loading}
      data={processedData}
    />
  )
}`,
    question: "Will the HOC memoization prevent unnecessary re-renders?",
    answer: "NO - Object spread in processedData breaks memoization",
    explanation:
      "The HOC correctly memoizes the wrapper, but processedData creates new objects ({ ...item, processed: true }) for every item on every render. Even if data array is the same, the items inside are 'new' objects, making processedData 'different' and breaking memoization. BONUS CASCADE EFFECT: Even if we fixed the spread, this could still break if the 'data' prop from Parent's parent isn't stable. Memoization is only as strong as its weakest link - unstable props anywhere up the component tree will cascade down and break all downstream memoization efforts.",
    isCorrect: false,
  },
];

interface BonusRoundProps {
  onComplete: () => void;
}

export function BonusRound({ onComplete }: BonusRoundProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);

  const slide = bonusSlides[currentSlide];
  const isLastSlide = currentSlide === bonusSlides.length - 1;

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
    (answer, index) => answer === bonusSlides[index].isCorrect
  ).length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Hard":
        return "#ff9500";
      case "Expert":
        return "#ff6b6b";
      case "Nightmare":
        return "#8b5cf6";
      default:
        return "#646cff";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "Hard":
        return "🔥";
      case "Expert":
        return "💀";
      case "Nightmare":
        return "👹";
      default:
        return "🎯";
    }
  };

  return (
    <div className="slideshow-container bonus-round">
      <div className="slideshow-header">
        <h2>🎯 Bonus Round - Advanced Memoization Traps</h2>
        <div className="slide-counter">
          Challenge {currentSlide + 1} of {bonusSlides.length}
        </div>
      </div>

      <div className="slide-progress">
        <div
          className="slide-progress-bar bonus-progress"
          style={{
            width: `${((currentSlide + 1) / bonusSlides.length) * 100}%`,
          }}
        />
      </div>

      <div className="slide-content">
        <div className="slide-title-row">
          <h3 className="slide-title">{slide.title}</h3>
          <div
            className="difficulty-badge"
            style={{
              backgroundColor: `${getDifficultyColor(slide.difficulty)}20`,
              border: `1px solid ${getDifficultyColor(slide.difficulty)}40`,
              color: getDifficultyColor(slide.difficulty),
            }}
          >
            {getDifficultyIcon(slide.difficulty)} {slide.difficulty}
          </div>
        </div>

        <CodeBlock code={slide.code} title="Advanced Code Challenge" />

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
                  {userAnswers[currentSlide] === slide.isCorrect ? (
                    <>
                      <strong>Correct:</strong> {slide.answer}
                    </>
                  ) : (
                    <>
                      <strong>Wrong:</strong> {slide.answer}
                    </>
                  )}
                </div>
                {userAnswers[currentSlide] === slide.isCorrect ? (
                  <div className="result-icon">😊</div>
                ) : (
                  <div className="result-icon">😞</div>
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
          {bonusSlides.map((bonusSlide, index) => (
            <div
              key={index}
              className={`slide-dot ${index === currentSlide ? "active" : ""} ${
                userAnswers[index] !== undefined ? "completed" : ""
              }`}
              style={{
                borderColor:
                  userAnswers[index] !== undefined
                    ? getDifficultyColor(bonusSlide.difficulty)
                    : undefined,
              }}
              onClick={() => {
                setCurrentSlide(index);
                setShowAnswer(userAnswers[index] !== undefined);
              }}
            />
          ))}
        </div>

        {showAnswer && (
          <button className="nav-btn nav-btn-primary" onClick={nextSlide}>
            {isLastSlide ? "Finish Bonus Round" : "Next Challenge →"}
          </button>
        )}
      </div>

      {isLastSlide && showAnswer && (
        <div className="quiz-summary bonus-summary">
          <h4>🏆 Bonus Round Complete!</h4>
          <p>
            You got <strong>{correctAnswers}</strong> out of{" "}
            <strong>{bonusSlides.length}</strong> correct!
          </p>
          {correctAnswers === bonusSlides.length && (
            <div className="perfect-score">
              🎉 Perfect Score! You're a memoization master! 🎉
            </div>
          )}
          {correctAnswers >= bonusSlides.length * 0.7 &&
            correctAnswers < bonusSlides.length && (
              <div className="good-score">
                🔥 Excellent work! You really know your stuff!
              </div>
            )}
          {correctAnswers < bonusSlides.length * 0.7 && (
            <div className="needs-work">
              💪 These are tricky! Try the bonus round again after reviewing the
              concepts.
            </div>
          )}
          <button className="reset-btn" onClick={resetQuiz}>
            🔄 Take Bonus Round Again
          </button>
        </div>
      )}
    </div>
  );
}
