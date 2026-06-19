# Threat Model

## Goal

This document gives a practical threat model for Code Summarizer so reviewers can quickly understand what the tool is trying to protect, what assumptions it makes, and where its limits are.

## Assets to Protect

- Sensitive source code snippets
- Hardcoded secrets accidentally pasted into snippets
- Internal implementation details
- Developer workflow privacy
- Trust in local-only analysis behavior

## Primary Security Goals

- Keep code analysis local to the user's machine
- Reduce accidental exposure of secrets
- Avoid dependency on internet-hosted AI services
- Make data flow simple enough to review and audit

## Threat Actors

- Accidental user mistakes, such as pasting secrets
- Unapproved external services that would receive code if the app sent data remotely
- Malicious or risky dependencies
- Misconfigured local environments
- Unapproved or untrusted local model artifacts
- A malicious local process that binds to or controls the expected Ollama loopback endpoint
- A local user or endpoint tool able to inspect process memory, the clipboard, or the screen

## Trust Assumptions

This project assumes:

- The local machine itself is trusted enough to run the application
- Ollama is installed from an acceptable source
- The local model files are acceptable for the environment
- The workstation is governed by local endpoint controls
- The user understands that LLM output can be incorrect

## Main Data Flow

1. User pastes code into the desktop app
2. App scans for likely secrets
3. App optionally redacts detected secrets
4. App builds a prompt locally
5. App sends the prompt to the local Ollama instance on localhost
6. App validates the returned JSON structure
7. App renders the structured response locally

## Threats Considered

### Data Exfiltration to Cloud Services

Mitigation:

- App design is local-first
- Intended model communication is localhost only
- No external AI API integration is built into the application

Residual risk:

- Host or local runtime misconfiguration
- Future code changes

### Accidental Secret Exposure

Mitigation:

- Secret scanning
- Redaction support
- Sensitive Mode can enforce redaction and hide raw model output
- Sensitive Mode disables app-provided clipboard export

Residual risk:

- Regex-based scanning is not exhaustive
- User can still paste more than necessary
- Input and model output remain temporarily present in process memory
- Operating-system capture and monitoring are outside the app's control

### Loopback Service Impersonation

Mitigation:

- The destination is fixed to `127.0.0.1:11434`; remote and user-selected endpoints are rejected by design
- Responses are parsed as data and validated against a schema rather than executed as code

Residual risk:

- Loopback does not authenticate Ollama; a malicious local process could receive prompts or return crafted text
- Host-level controls and an approved Ollama deployment remain required for restricted use

### Unsafe Trust in Model Output

Mitigation:

- Structured JSON schema validation
- Clear documentation that validation is model-guided, not compiler-backed

Residual risk:

- LLMs can hallucinate, miss issues, or be overconfident

### Supply Chain Risk

Mitigation:

- Open source code review path
- Lockfiles present in the repo
- Local build option

Residual risk:

- Third-party dependencies still require organizational review
- Local model runtime and model weights are separate trust decisions

## Out of Scope

The application does not currently attempt to solve:

- Formal classified-environment accreditation
- Enterprise identity management
- Compiler-accurate validation for every supported language
- Centralized audit and SIEM integration
- Guaranteed detection of every secret type

## Recommended Hardening

- Build from source in a controlled environment
- Review dependencies before approval
- Restrict to approved workstations
- Approve Ollama and model files separately
- Use Sensitive Mode by default for higher-risk work
- Re-review changes before updating deployed versions
- Verify release SHA-256 checksums and, when available, Authenticode signatures
