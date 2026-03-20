import React, { useState } from "react";
import type { CodeAnalysis } from "../lib/schemas";
import { RiskBadges } from "./RiskBadges";

interface OutputPanelProps {
  analysis: CodeAnalysis | null;
  rawOutput?: string;
  error?: string;
}

export function OutputPanel({ analysis, rawOutput, error }: OutputPanelProps) {
  const [showRawOutput, setShowRawOutput] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} copied to clipboard!`);
    });
  };

  if (error) {
    return (
      <div className="output-panel">
        <div className="error-container">
          <h3>Error</h3>
          <p className="error-text">{error}</p>
          {rawOutput && (
            <>
              <button
                className="toggle-button"
                onClick={() => setShowRawOutput(!showRawOutput)}
              >
                {showRawOutput ? "Hide" : "Show"} Raw Output
              </button>
              {showRawOutput && (
                <pre className="raw-output">{rawOutput}</pre>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="output-panel">
        <p className="empty-message">
          No analysis yet. Paste code and click an action button to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="output-panel">
      {/* Validation Results Section (validate mode only) */}
      {analysis.is_valid !== undefined && (
        <section className="output-section">
          <div className="section-header">
            <h3>Validation Result</h3>
            <button
              className="copy-button"
              onClick={() => {
                const errors = analysis.syntax_errors ?? [];
                const text = analysis.is_valid
                  ? "No errors found — code is valid."
                  : errors
                      .map(
                        (e) =>
                          `[${e.severity.toUpperCase()}]${e.line != null ? ` Line ${e.line}` : ""}${e.column != null ? `:${e.column}` : ""} — ${e.message}`
                      )
                      .join("\n");
                copyToClipboard(text, "Validation Result");
              }}
            >
              Copy
            </button>
          </div>
          <div
            className={`validation-status ${analysis.is_valid ? "validation-valid" : "validation-invalid"}`}
          >
            {analysis.is_valid ? "Valid — no errors found" : "Invalid — errors detected"}
          </div>
          {(analysis.syntax_errors ?? []).length > 0 && (
            <ul className="syntax-errors-list">
              {(analysis.syntax_errors ?? []).map((err, index) => (
                <li key={index} className={`syntax-error-item syntax-error-${err.severity}`}>
                  <span className="syntax-error-badge">{err.severity}</span>
                  {err.line != null && (
                    <span className="syntax-error-location">
                      Line {err.line}{err.column != null ? `:${err.column}` : ""}
                    </span>
                  )}
                  <span className="syntax-error-message">{err.message}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Summary Section */}
      <section className="output-section">
        <div className="section-header">
          <h3>Summary</h3>
          <button
            className="copy-button"
            onClick={() =>
              copyToClipboard(analysis.summary.join("\n"), "Summary")
            }
          >
            Copy
          </button>
        </div>
        {analysis.summary.length > 0 ? (
          <ul className="bullet-list">
            {analysis.summary.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">No summary available</p>
        )}
      </section>

      {/* Walkthrough Section */}
      <section className="output-section">
        <div className="section-header">
          <h3>Walkthrough</h3>
          <button
            className="copy-button"
            onClick={() =>
              copyToClipboard(analysis.walkthrough.join("\n"), "Walkthrough")
            }
          >
            Copy
          </button>
        </div>
        {analysis.walkthrough.length > 0 ? (
          <ol className="numbered-list">
            {analysis.walkthrough.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        ) : (
          <p className="empty-message">No walkthrough available</p>
        )}
      </section>

      {/* Inputs Section */}
      <section className="output-section">
        <div className="section-header">
          <h3>Inputs</h3>
          <button
            className="copy-button"
            onClick={() =>
              copyToClipboard(analysis.inputs.join("\n"), "Inputs")
            }
          >
            Copy
          </button>
        </div>
        {analysis.inputs.length > 0 ? (
          <ul className="bullet-list">
            {analysis.inputs.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">No inputs identified</p>
        )}
      </section>

      {/* Outputs Section */}
      <section className="output-section">
        <div className="section-header">
          <h3>Outputs</h3>
          <button
            className="copy-button"
            onClick={() =>
              copyToClipboard(analysis.outputs.join("\n"), "Outputs")
            }
          >
            Copy
          </button>
        </div>
        {analysis.outputs.length > 0 ? (
          <ul className="bullet-list">
            {analysis.outputs.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">No outputs identified</p>
        )}
      </section>

      {/* Side Effects Section */}
      <section className="output-section">
        <div className="section-header">
          <h3>Side Effects</h3>
          <button
            className="copy-button"
            onClick={() =>
              copyToClipboard(analysis.side_effects.join("\n"), "Side Effects")
            }
          >
            Copy
          </button>
        </div>
        {analysis.side_effects.length > 0 ? (
          <ul className="bullet-list">
            {analysis.side_effects.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">No side effects identified</p>
        )}
      </section>

      {/* Risks Section */}
      <section className="output-section">
        <div className="section-header">
          <h3>Risks</h3>
          <button
            className="copy-button"
            onClick={() =>
              copyToClipboard(
                analysis.risks
                  .map((r) => `[${r.level.toUpperCase()}] ${r.item}`)
                  .join("\n"),
                "Risks"
              )
            }
          >
            Copy
          </button>
        </div>
        <RiskBadges risks={analysis.risks} />
      </section>

      {/* Junior Explanation Section */}
      <section className="output-section">
        <div className="section-header">
          <h3>Junior Explanation</h3>
          <button
            className="copy-button"
            onClick={() =>
              copyToClipboard(analysis.junior_explanation, "Junior Explanation")
            }
          >
            Copy
          </button>
        </div>
        {analysis.junior_explanation ? (
          <p className="explanation-text">{analysis.junior_explanation}</p>
        ) : (
          <p className="empty-message">No explanation available</p>
        )}
      </section>

      {/* Confidence Section */}
      <section className="output-section">
        <div className="section-header">
          <h3>Confidence</h3>
        </div>
        <div className="confidence-container">
          <div className="confidence-bar-bg">
            <div
              className="confidence-bar-fill"
              style={{ width: `${analysis.confidence * 100}%` }}
            />
          </div>
          <span className="confidence-text">
            {(analysis.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </section>

      {/* Raw Output (if needed for debugging) */}
      {rawOutput && (
        <section className="output-section">
          <button
            className="toggle-button"
            onClick={() => setShowRawOutput(!showRawOutput)}
          >
            {showRawOutput ? "Hide" : "Show"} Raw Model Output
          </button>
          {showRawOutput && <pre className="raw-output">{rawOutput}</pre>}
        </section>
      )}
    </div>
  );
}
