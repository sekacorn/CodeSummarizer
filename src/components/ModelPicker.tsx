import React from "react";

interface ModelPickerProps {
  models: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  isLoading?: boolean;
  error?: string;
}

export function ModelPicker({
  models,
  selectedModel,
  onModelChange,
  isLoading,
  error,
}: ModelPickerProps) {
  return (
    <div className="picker-container">
      <label htmlFor="model-select" className="input-label">
        Model
      </label>
      {error ? (
        <div className="error-text">{error}</div>
      ) : (
        <select
          id="model-select"
          className="select-input"
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={isLoading || models.length === 0}
        >
          {isLoading ? (
            <option>Loading models...</option>
          ) : models.length === 0 ? (
            <option>No models available</option>
          ) : (
            <>
              {!selectedModel && <option value="">Select a model</option>}
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </>
          )}
        </select>
      )}
    </div>
  );
}
