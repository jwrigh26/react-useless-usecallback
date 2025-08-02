import { useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useDebounceBroken } from "../hooks/useDebounceBroken";
import { useRenderCounter } from "../hooks/useRenderCounter";
import { CodeBlock } from "./CodeBlock";

interface FormData {
  username: string;
  email: string;
  password: string;
}

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
}

// Simulate API validation
const validateField = (
  field: string,
  value: string
): Promise<string | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      switch (field) {
        case "username":
          if (value.length < 3)
            resolve("Username must be at least 3 characters");
          else if (value === "admin")
            resolve('Username "admin" is not available');
          else resolve(null);
          break;
        case "email":
          if (!value.includes("@")) resolve("Invalid email format");
          else if (value === "test@test.com") resolve("Email already taken");
          else resolve(null);
          break;
        case "password":
          if (value.length < 8)
            resolve("Password must be at least 8 characters");
          else if (!/\d/.test(value))
            resolve("Password must contain at least one number");
          else resolve(null);
          break;
        default:
          resolve(null);
      }
    }, 500); // Simulate network delay
  });
};

interface FormDemoProps {
  title: string;
  version: "broken" | "fixed";
}

function FormDemo({ title, version }: FormDemoProps) {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [validating, setValidating] = useState<Set<string>>(new Set());
  const renderCount = useRenderCounter(`FormDemo-${version}`);

  // This validation function changes on every render in the broken version
  const validateFieldAsync = async (field: string, value: string) => {
    setValidating((prev) => new Set(prev).add(field));

    try {
      const error = await validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    } finally {
      setValidating((prev) => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  };

  // Always call both hooks to avoid Rules of Hooks violations
  const debouncedValidateBroken = useDebounceBroken(validateFieldAsync, 500);
  const debouncedValidateFixed = useDebounce(validateFieldAsync, 500);
  
  // Select which debounced function to use based on version
  const debouncedValidate = version === "broken" ? debouncedValidateBroken : debouncedValidateFixed;

  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear existing error and trigger validation
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      debouncedValidate(field, value);
    };

  return (
    <div className="demo-section">
      <div className="demo-title">{title}</div>

      <div className="render-counter">
        <div className="render-count">{renderCount}</div>
        <div>Renders</div>
      </div>

      <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "600",
            }}
          >
            Username:
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={handleInputChange("username")}
            placeholder="Enter username..."
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "4px",
              border: `2px solid ${errors.username ? "#ff6b6b" : "#333"}`,
              background: "#1a1a1a",
              color: "white",
            }}
          />
          {validating.has("username") && (
            <div
              style={{
                color: "#646cff",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
              }}
            >
              Validating...
            </div>
          )}
          {errors.username && (
            <div
              style={{
                color: "#ff6b6b",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
              }}
            >
              {errors.username}
            </div>
          )}
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "600",
            }}
          >
            Email:
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            placeholder="Enter email..."
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "4px",
              border: `2px solid ${errors.email ? "#ff6b6b" : "#333"}`,
              background: "#1a1a1a",
              color: "white",
            }}
          />
          {validating.has("email") && (
            <div
              style={{
                color: "#646cff",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
              }}
            >
              Validating...
            </div>
          )}
          {errors.email && (
            <div
              style={{
                color: "#ff6b6b",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
              }}
            >
              {errors.email}
            </div>
          )}
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "600",
            }}
          >
            Password:
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={handleInputChange("password")}
            placeholder="Enter password..."
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "4px",
              border: `2px solid ${errors.password ? "#ff6b6b" : "#333"}`,
              background: "#1a1a1a",
              color: "white",
            }}
          />
          {validating.has("password") && (
            <div
              style={{
                color: "#646cff",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
              }}
            >
              Validating...
            </div>
          )}
          {errors.password && (
            <div
              style={{
                color: "#ff6b6b",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
              }}
            >
              {errors.password}
            </div>
          )}
        </div>
      </form>

      {version === "broken" && (
        <div className="performance-tip">
          <div className="performance-tip-title">⚠️ Performance Issue</div>
          <div>
            Every keystroke creates a new debounced validation function because
            the callback depends on state that changes frequently. This can
            cause validation to behave unpredictably.
          </div>
        </div>
      )}

      {version === "fixed" && (
        <div className="performance-tip">
          <div className="performance-tip-title">✅ Performance Optimized</div>
          <div>
            The debounced validation function is stable, ensuring consistent
            debounce behavior regardless of how many times the component
            re-renders.
          </div>
        </div>
      )}
    </div>
  );
}

export function FormDebounceExample() {
  const [activeTab, setActiveTab] = useState<"broken" | "fixed">("broken");

  const brokenUsageCode = `function FormComponent() {
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [errors, setErrors] = useState({});

  // ❌ This function changes on every render due to state dependencies
  const validateFieldAsync = async (field: string, value: string) => {
    // Uses formData, errors state - causes callback to change
    const error = await validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // ❌ debouncedValidate is recreated every render!
  const debouncedValidate = useDebounceBroken(validateFieldAsync, 500);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    debouncedValidate(field, e.target.value); // Inconsistent debouncing!
  };

  // Rest of component...
}`;

  const fixedUsageCode = `function FormComponent() {
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [errors, setErrors] = useState({});

  // ✅ This function doesn't depend on state that changes frequently
  const validateFieldAsync = async (field: string, value: string) => {
    // Uses functional updates - no dependency on current state
    const error = await validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // ✅ debouncedValidate is stable thanks to Latest Ref Pattern
  const debouncedValidate = useDebounce(validateFieldAsync, 500);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    debouncedValidate(field, e.target.value); // Consistent debouncing!
  };

  // Rest of component...
}`;

  return (
    <div className="example-container">
      <div className="example-header">
        <h2 className="example-title">📝 Form Validation with Debounce</h2>
        <p className="example-description">
          This example shows how useless useCallback affects form validation. In
          the broken version, rapid typing can cause inconsistent validation
          behavior because the debounced function keeps changing.
        </p>
      </div>

      <div className="example-tabs">
        <button
          className={`tab-button ${activeTab === "broken" ? "active" : ""}`}
          onClick={() => setActiveTab("broken")}
        >
          ❌ Broken Validation
        </button>
        <button
          className={`tab-button ${activeTab === "fixed" ? "active" : ""}`}
          onClick={() => setActiveTab("fixed")}
        >
          ✅ Fixed Validation
        </button>
      </div>

      <div className="example-content">
        <FormDemo
          title={
            activeTab === "broken"
              ? "❌ Broken: Inconsistent Debouncing"
              : "✅ Fixed: Stable Debouncing"
          }
          version={activeTab}
        />

        <div>
          <CodeBlock
            code={activeTab === "broken" ? brokenUsageCode : fixedUsageCode}
            title={`${
              activeTab === "broken" ? "Broken" : "Fixed"
            } Usage Example`}
            status={activeTab}
          />
        </div>
      </div>

      <div className="performance-tip">
        <div className="performance-tip-title">🎯 Try This</div>
        <ul>
          <li>
            <strong>Type rapidly:</strong> Try typing quickly in the username
            field in both versions
          </li>
          <li>
            <strong>Watch validation timing:</strong> In the broken version,
            validation might feel inconsistent
          </li>
          <li>
            <strong>Check render count:</strong> Notice how both versions
            re-render, but the broken one recreates the debounced function
          </li>
          <li>
            <strong>Real-world impact:</strong> In complex forms, this can lead
            to validation race conditions and poor UX
          </li>
        </ul>
      </div>
    </div>
  );
}
