import React from "react";

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CodeInput({ value, onChange, placeholder }: CodeInputProps) {
  return (
    <div className="code-input-container">
      <label htmlFor="code-input" className="input-label">
        Paste Your Code
      </label>
      <textarea
        id="code-input"
        className="code-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Paste your code here..."}
        spellCheck={false}
      />
    </div>
  );
}
