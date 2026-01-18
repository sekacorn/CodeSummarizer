import React, { useState, useEffect } from "react";
import { CodeInput } from "./components/CodeInput";
import { ModelPicker } from "./components/ModelPicker";
import { OutputPanel } from "./components/OutputPanel";
import { listOllamaModels, summarizeCode } from "./lib/api";
import { parseModelOutput, type CodeAnalysis, type SecretFinding } from "./lib/schemas";
import { SUPPORTED_LANGUAGES, ANALYSIS_MODES } from "./lib/languages";

function App() {
  // State
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | undefined>();
  const [redactSecrets, setRedactSecrets] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [rawOutput, setRawOutput] = useState<string | undefined>();
  const [outputError, setOutputError] = useState<string | undefined>();
  const [secretFindings, setSecretFindings] = useState<SecretFinding[]>([]);

  // Load models on mount
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setModelsLoading(true);
    setModelsError(undefined);
    try {
      const modelList = await listOllamaModels();
      setModels(modelList);
      if (modelList.length > 0 && !selectedModel) {
        setSelectedModel(modelList[0]);
      }
    } catch (error) {
      setModelsError(String(error));
    } finally {
      setModelsLoading(false);
    }
  };

  const handleAnalyze = async (mode: string) => {
    if (!code.trim()) {
      alert("Please paste some code first.");
      return;
    }

    if (!selectedModel) {
      alert("Please select a model.");
      return;
    }

    setIsProcessing(true);
    setAnalysis(null);
    setOutputError(undefined);
    setRawOutput(undefined);
    setSecretFindings([]);

    try {
      const response = await summarizeCode(
        language,
        code,
        selectedModel,
        mode,
        redactSecrets
      );

      // Store secret findings
      setSecretFindings(response.findings);

      // Parse the model output
      const parseResult = parseModelOutput(response.model_output);

      if (parseResult.success && parseResult.data) {
        setAnalysis(parseResult.data);
        setRawOutput(response.model_output);
      } else {
        setOutputError(parseResult.error);
        setRawOutput(response.model_output);
      }
    } catch (error) {
      setOutputError(String(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setAnalysis(null);
    setOutputError(undefined);
    setRawOutput(undefined);
    setSecretFindings([]);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1>Code Summarizer</h1>
        <p className="subtitle">
          Local-first code analysis • Privacy-first • No cloud calls
        </p>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel - Input */}
        <div className="left-panel">
          <div className="controls-row">
            {/* Language Picker */}
            <div className="picker-container">
              <label htmlFor="language-select" className="input-label">
                Language
              </label>
              <select
                id="language-select"
                className="select-input"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Picker */}
            <ModelPicker
              models={models}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              isLoading={modelsLoading}
              error={modelsError}
            />

            {/* Redaction Toggle */}
            <div className="toggle-container">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={redactSecrets}
                  onChange={(e) => setRedactSecrets(e.target.checked)}
                />
                <span>Mask secrets before sending to model</span>
              </label>
            </div>
          </div>

          {/* Code Input */}
          <CodeInput value={code} onChange={setCode} />

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="action-button primary"
              onClick={() => handleAnalyze(ANALYSIS_MODES.SUMMARIZE)}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Summarize"}
            </button>
            <button
              className="action-button primary"
              onClick={() => handleAnalyze(ANALYSIS_MODES.JUNIOR)}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Explain for Junior"}
            </button>
            <button
              className="action-button primary"
              onClick={() => handleAnalyze(ANALYSIS_MODES.RISK)}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Risk Scan"}
            </button>
            <button
              className="action-button secondary"
              onClick={handleClear}
              disabled={isProcessing}
            >
              Clear
            </button>
          </div>

          {/* Secret Warnings */}
          {secretFindings.length > 0 && (
            <div className="warnings-panel">
              <h3 className="warning-title">Secrets Detected</h3>
              <p className="warning-text">
                {redactSecrets
                  ? "The following secrets were masked before sending to the model:"
                  : "Warning: The following secrets were found but NOT masked:"}
              </p>
              <ul className="warnings-list">
                {secretFindings.map((finding, index) => (
                  <li key={index}>
                    <strong>{finding.kind}:</strong> {finding.preview}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Panel - Output */}
        <div className="right-panel">
          <OutputPanel
            analysis={analysis}
            rawOutput={rawOutput}
            error={outputError}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
