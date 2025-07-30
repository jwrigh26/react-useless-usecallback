import { Highlight, themes } from "prism-react-renderer";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  status?: "broken" | "fixed";
}

export function CodeBlock({
  code,
  language = "typescript",
  title,
  status,
}: CodeBlockProps) {
  return (
    <div className="code-section">
      {title && (
        <div className="code-header">
          <span>{title}</span>
          {status && (
            <span className={`status-indicator status-${status}`}>
              {status === "broken" ? "❌ Broken" : "✅ Fixed"}
            </span>
          )}
        </div>
      )}
      <div className="code-content">
        <Highlight theme={themes.vsDark} code={code.trim()} language={language}>
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre style={{ ...style, background: "transparent", margin: 0 }}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
