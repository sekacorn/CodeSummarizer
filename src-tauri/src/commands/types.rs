use serde::{Deserialize, Serialize};

/// Represents a finding from secret scanning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecretFinding {
    /// Type of secret detected (e.g., "AWS Key", "JWT Token")
    pub kind: String,
    /// Starting position in the original code
    pub start: usize,
    /// Safe preview of the finding (truncated/masked)
    pub preview: String,
}

/// Result of scanning code for secrets
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecretScanResult {
    /// List of detected secrets
    pub findings: Vec<SecretFinding>,
}

/// Response from the summarize command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SummarizeResponse {
    /// Raw output from the model (JSON string expected)
    pub model_output: String,
    /// Whether the code was redacted before sending to model
    pub redacted: bool,
    /// Secrets that were found (and possibly redacted)
    pub findings: Vec<SecretFinding>,
}

/// Ollama API response for listing models
#[derive(Debug, Deserialize)]
pub struct OllamaModelsResponse {
    pub models: Vec<OllamaModel>,
}

#[derive(Debug, Deserialize)]
pub struct OllamaModel {
    pub name: String,
}

/// Ollama API request for generating completions
#[derive(Debug, Serialize)]
pub struct OllamaGenerateRequest {
    pub model: String,
    pub prompt: String,
    pub stream: bool,
}

/// Ollama API response for generate endpoint
#[derive(Debug, Deserialize)]
pub struct OllamaGenerateResponse {
    pub response: String,
}
