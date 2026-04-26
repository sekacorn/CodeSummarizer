# Architecture Notes

## Overview

Code Summarizer is a desktop application that combines a React frontend, a Rust/Tauri backend, and a locally installed Ollama runtime.

The design goal is simple: keep code analysis local, structured, and easy to review.

## Main Components

### Frontend

- React + TypeScript
- Presents the UI for code input, language selection, model selection, and result rendering
- Validates structured model output with Zod before displaying it

### Backend

- Rust command handlers exposed through Tauri
- Performs secret scanning and optional redaction
- Builds prompts for each analysis mode
- Sends requests to the local Ollama instance

### Local Model Runtime

- Ollama running on the local machine
- Provides installed local models selected by the user
- Receives prompts over localhost only

## Data Flow

```text
User snippet
  -> secret scan
  -> optional redaction
  -> prompt construction
  -> localhost Ollama request
  -> JSON model response
  -> schema validation
  -> local UI rendering
```

## Analysis Modes

- `Summarize`
- `Explain for Junior`
- `Risk Scan`
- `Validate`

Important note:

- `Validate` is currently LLM-guided validation, not compiler-backed analysis

## Security-Relevant Design Points

- Localhost-only model communication
- Optional secret redaction before model use
- No external AI service integration in the application code
- Structured JSON output expectations
- Sensitive Mode to enforce redaction and suppress raw model output

## Key Files

- `src/App.tsx`: Main UI state and interaction flow
- `src/lib/languages.ts`: Supported language list and analysis modes
- `src/lib/schemas.ts`: Structured output schema validation
- `src-tauri/src/main.rs`: Tauri command wiring
- `src-tauri/src/commands/secrets.rs`: Secret scanning and redaction
- `src-tauri/src/commands/prompt.rs`: Prompt construction
- `src-tauri/src/commands/ollama.rs`: Ollama API integration
