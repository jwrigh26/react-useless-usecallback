import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRenderCounter } from "../hooks/useRenderCounter";
import { CodeBlock } from "./CodeBlock";

// Broken Context Implementation
interface BrokenContextState {
  count: number;
  items: string[];
  user: { name: string; id: number };
}

interface BrokenContextValue extends BrokenContextState {
  increment: () => void;
  decrement: () => void;
  addItem: (item: string) => void;
  removeItem: (index: number) => void;
  updateUser: (name: string) => void;
}

const BrokenContext = createContext<BrokenContextValue | null>(null);

function BrokenProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BrokenContextState>({
    count: 0,
    items: ["Item 1", "Item 2"],
    user: { name: "John Doe", id: 1 },
  });

  // ❌ These callbacks depend on state, breaking on every state change
  const increment = useCallback(() => {
    setState((prev) => ({ ...prev, count: prev.count + 1 }));
  }, [state]); // Breaks memoization!

  const decrement = useCallback(() => {
    setState((prev) => ({ ...prev, count: prev.count - 1 }));
  }, [state]); // Breaks memoization!

  const addItem = useCallback(
    (item: string) => {
      setState((prev) => ({ ...prev, items: [...prev.items, item] }));
    },
    [state]
  ); // Breaks memoization!

  const removeItem = useCallback(
    (index: number) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    },
    [state]
  ); // Breaks memoization!

  const updateUser = useCallback(
    (name: string) => {
      setState((prev) => ({
        ...prev,
        user: { ...prev.user, name },
      }));
    },
    [state]
  ); // Breaks memoization!

  // ❌ This memo is useless because state changes on every update
  const value = useMemo(
    () => ({
      ...state, // This makes the memo pointless
      increment,
      decrement,
      addItem,
      removeItem,
      updateUser,
    }),
    [state, increment, decrement, addItem, removeItem, updateUser]
  );

  return (
    <BrokenContext.Provider value={value}>{children}</BrokenContext.Provider>
  );
}

// Fixed Context Implementation
const FixedContext = createContext<BrokenContextValue | null>(null);

function FixedProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BrokenContextState>({
    count: 0,
    items: ["Item 1", "Item 2"],
    user: { name: "John Doe", id: 1 },
  });

  // ✅ These callbacks have no dependencies - stable forever
  const increment = useCallback(() => {
    setState((prev) => ({ ...prev, count: prev.count + 1 }));
  }, []); // No dependencies!

  const decrement = useCallback(() => {
    setState((prev) => ({ ...prev, count: prev.count - 1 }));
  }, []); // No dependencies!

  const addItem = useCallback((item: string) => {
    setState((prev) => ({ ...prev, items: [...prev.items, item] }));
  }, []); // No dependencies!

  const removeItem = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []); // No dependencies!

  const updateUser = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, name },
    }));
  }, []); // No dependencies!

  // ✅ Just create the object directly - no useMemo needed
  // The individual functions are already stable
  const value = {
    ...state,
    increment,
    decrement,
    addItem,
    removeItem,
    updateUser,
  };

  return (
    <FixedContext.Provider value={value}>{children}</FixedContext.Provider>
  );
}

// Consumer component
function Counter({ version }: { version: "broken" | "fixed" }) {
  const context = useContext(
    version === "broken" ? BrokenContext : FixedContext
  );
  const renderCount = useRenderCounter(`Counter-${version}`);

  if (!context) throw new Error("Counter must be used within Provider");

  const { count, increment, decrement } = context;

  return (
    <div className="demo-section">
      <div className="demo-title">Counter Component</div>

      <div className="render-counter">
        <div className="render-count">{renderCount}</div>
        <div>Renders</div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <button onClick={decrement}>-</button>
        <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{count}</span>
        <button onClick={increment}>+</button>
      </div>

      {version === "broken" && (
        <div className="performance-tip">
          <div className="performance-tip-title">
            ⚠️ Re-renders on Every State Change
          </div>
          <div>
            This component re-renders whenever ANY part of the context state
            changes, even if it only uses count, increment, and decrement.
          </div>
        </div>
      )}

      {version === "fixed" && (
        <div className="performance-tip">
          <div className="performance-tip-title">
            ✅ Still Re-renders (But Functions Are Stable)
          </div>
          <div>
            This component still re-renders when count changes (which is
            expected), but the callback functions are stable and don't cause
            unnecessary re-renders in child components that might depend on
            them.
          </div>
        </div>
      )}
    </div>
  );
}

function ItemList({ version }: { version: "broken" | "fixed" }) {
  const context = useContext(
    version === "broken" ? BrokenContext : FixedContext
  );
  const renderCount = useRenderCounter(`ItemList-${version}`);
  const [newItem, setNewItem] = useState("");

  if (!context) throw new Error("ItemList must be used within Provider");

  const { items, addItem, removeItem } = context;

  const handleAddItem = () => {
    if (newItem.trim()) {
      addItem(newItem.trim());
      setNewItem("");
    }
  };

  return (
    <div className="demo-section">
      <div className="demo-title">Item List Component</div>

      <div className="render-counter">
        <div className="render-count">{renderCount}</div>
        <div>Renders</div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item..."
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #333",
            background: "#1a1a1a",
            color: "white",
          }}
        />
        <button onClick={handleAddItem}>Add</button>
      </div>

      <div>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.5rem",
              border: "1px solid #333",
              borderRadius: "4px",
              marginBottom: "0.5rem",
            }}
          >
            <span>{item}</span>
            <button
              onClick={() => removeItem(index)}
              style={{
                background: "#ff6b6b",
                border: "none",
                color: "white",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {version === "broken" && (
        <div className="performance-tip">
          <div className="performance-tip-title">
            ⚠️ Re-renders When Counter Changes!
          </div>
          <div>
            Try incrementing the counter above. This component re-renders even
            though it doesn't use the count value at all. The context functions
            change every time.
          </div>
        </div>
      )}

      {version === "fixed" && (
        <div className="performance-tip">
          <div className="performance-tip-title">
            ✅ Still Re-renders When Items Change
          </div>
          <div>
            This component re-renders when items change (expected), but
            increment the counter above - it won't re-render unnecessarily
            because the functions are stable.
          </div>
        </div>
      )}
    </div>
  );
}

export function ContextExample() {
  const [activeTab, setActiveTab] = useState<"broken" | "fixed">("broken");

  const brokenCode = `function BrokenProvider({ children }) {
  const [state, setState] = useState({
    count: 0,
    items: ['Item 1', 'Item 2'],
    user: { name: 'John Doe', id: 1 }
  });

  // ❌ These callbacks depend on state, breaking on every state change
  const increment = useCallback(() => {
    setState(prev => ({ ...prev, count: prev.count + 1 }));
  }, [state]); // Breaks memoization!

  const addItem = useCallback((item: string) => {
    setState(prev => ({ ...prev, items: [...prev.items, item] }));
  }, [state]); // Breaks memoization!

  // ❌ This memo is useless because state changes on every update
  const value = useMemo(() => ({
    ...state, // This makes the memo pointless
    increment,
    addItem,
    // ... other functions
  }), [state, increment, addItem]); // All dependencies change!

  return <Context.Provider value={value}>{children}</Context.Provider>;
}`;

  const fixedCode = `function FixedProvider({ children }) {
  const [state, setState] = useState({
    count: 0,
    items: ['Item 1', 'Item 2'],
    user: { name: 'John Doe', id: 1 }
  });

  // ✅ These callbacks have no dependencies - stable forever
  const increment = useCallback(() => {
    setState(prev => ({ ...prev, count: prev.count + 1 }));
  }, []); // No dependencies!

  const addItem = useCallback((item: string) => {
    setState(prev => ({ ...prev, items: [...prev.items, item] }));
  }, []); // No dependencies!

  // ✅ Just create the object directly - no useMemo needed
  // The individual functions are already stable
  const value = {
    ...state,
    increment,
    addItem,
    // ... other functions
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}`;

  return (
    <div className="example-container">
      <div className="example-header">
        <h2 className="example-title">🏪 Context Provider Memoization</h2>
        <p className="example-description">
          This example demonstrates how over-memoizing context providers can be
          completely counterproductive when the dependencies include frequently
          changing state.
        </p>
      </div>

      <div className="example-tabs">
        <button
          className={`tab-button ${activeTab === "broken" ? "active" : ""}`}
          onClick={() => setActiveTab("broken")}
        >
          ❌ Over-memoized
        </button>
        <button
          className={`tab-button ${activeTab === "fixed" ? "active" : ""}`}
          onClick={() => setActiveTab("fixed")}
        >
          ✅ Simplified
        </button>
      </div>

      <div className="example-content">
        <div>
          {activeTab === "broken" ? (
            <BrokenProvider>
              <Counter version="broken" />
              <ItemList version="broken" />
            </BrokenProvider>
          ) : (
            <FixedProvider>
              <Counter version="fixed" />
              <ItemList version="fixed" />
            </FixedProvider>
          )}
        </div>

        <div>
          <CodeBlock
            code={activeTab === "broken" ? brokenCode : fixedCode}
            title={`${
              activeTab === "broken" ? "Over-memoized" : "Simplified"
            } Provider`}
            status={activeTab}
          />
        </div>
      </div>

      <div className="performance-tip">
        <div className="performance-tip-title">🎯 Key Learning Points</div>
        <ul>
          <li>
            <strong>Broken Version:</strong> All callbacks depend on{" "}
            <code>state</code>, making them change on every state update
          </li>
          <li>
            <strong>useMemo is useless:</strong> When you spread{" "}
            <code>...state</code> in the memoized object, it changes every time
            anyway
          </li>
          <li>
            <strong>Fixed Version:</strong> Use functional state updates with no
            dependencies for stable callbacks
          </li>
          <li>
            <strong>Remove unnecessary memos:</strong> If the object changes
            frequently anyway, don't memoize it
          </li>
          <li>
            <strong>Watch cross-component renders:</strong> In the broken
            version, changing the counter causes the item list to re-render
          </li>
        </ul>
      </div>
    </div>
  );
}
