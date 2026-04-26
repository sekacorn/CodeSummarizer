# Security Policy

## Overview

Code Summarizer is a local, privacy-first desktop application for analyzing code snippets with locally installed AI models. It is intended for developers who need code assistance without sending source code to external cloud services.

This document describes the current security posture of the project, its limitations, recommended operating practices, and the vulnerability reporting process.

## Important Trust Statement

Code Summarizer is designed to reduce exposure of sensitive code by keeping analysis local, but this repository should **not** be interpreted as a formal certification, accreditation, or authorization for use in classified environments.

Specifically:

- This repository is **not** represented here as independently security-audited
- This document does **not** guarantee that no malicious code exists
- This project should be reviewed by your own security, compliance, accreditation, or authorizing team before use in government, classified, regulated, or mission-sensitive environments
- Any operational deployment into a restricted environment should follow internal approval, hardening, monitoring, and validation procedures

## Security Architecture

### Privacy by Design

- **Local-first operation**: Analysis is performed using a locally running Ollama instance
- **No external AI API dependency**: The application is designed to avoid cloud AI calls
- **Localhost-only model communication**: Requests are sent to `http://127.0.0.1:11434`
- **User-managed models**: Models are installed and controlled by the user or organization
- **Secret redaction support**: Detected secrets can be masked before a snippet is sent to the local model

### Application Components

- **Frontend**: React + TypeScript
- **Desktop runtime**: Tauri
- **Backend logic**: Rust
- **Model runtime**: Ollama, installed locally by the user

### Data Handling

- Code snippets are processed in-memory by the application
- The application is designed not to persist code snippets to disk as part of normal use
- No telemetry pipeline is implemented in the application code
- Model communication is intended to stay on localhost only

## Current Security Properties

### Secret Protection

The application currently includes regex-based detection for:

- AWS access keys
- JWT tokens
- Password and API key style assignments
- PEM private keys
- Bearer tokens

When secret masking is enabled, detected secrets are redacted before the snippet is sent to the local model.

### Network Boundaries

- The intended model endpoint is localhost only
- Tauri CSP restricts `connect-src` to `http://127.0.0.1:11434`
- The application is designed as a local desktop tool, not a networked multi-user service

### Structured Output Handling

- Model outputs are expected to be JSON
- Output is validated against a Zod schema on the frontend
- Secret scanning occurs before the prompt is built and sent to the model

## Known Security Limitations

- **LLM-based validation**: The `Validate` mode is model-guided, not compiler-backed
- **Regex-based secret detection**: Secret scanning is helpful but not exhaustive
- **Model quality risk**: Analysis accuracy depends on the selected local model
- **No enterprise identity layer**: This is a local desktop app, not a centralized IAM-integrated platform
- **No formal accreditation artifacts**: This repo does not provide ATO, RMF, FedRAMP, IL, or equivalent authorization documentation by itself

## Recommended Use in Sensitive Environments

If you are evaluating this application for sensitive or government-adjacent work, the safer position is:

- Treat the application as a **candidate tool** pending internal review
- Validate the source code internally before deployment
- Build from source in a controlled environment
- Review dependencies before promotion into restricted networks
- Test only with approved local models
- Confirm that Ollama and model artifacts meet local policy requirements
- Verify that no unapproved outbound network access exists in your environment
- Use redaction by default
- Limit pasted content to the minimum necessary snippet

## Controlled Environment Checklist

Before using this tool in a protected environment:

- Review the full source code and dependency tree
- Verify the exact Git revision being deployed
- Build artifacts in a trusted environment
- Pin dependency versions where required by policy
- Review Tauri configuration and CSP settings
- Confirm localhost-only model connectivity
- Validate Ollama installation source and version
- Approve local model files separately from the app
- Test secret redaction behavior with representative samples
- Run malware scanning and software composition analysis as required
- Confirm endpoint logging and host monitoring policies
- Restrict execution to approved workstations
- Document installation and update procedures
- Perform an internal security review before operational use

## Supply Chain Considerations

This project depends on:

- Node.js packages for the frontend toolchain
- Rust crates for the desktop/backend logic
- Tauri runtime components
- Ollama and locally installed language models

For higher-trust environments, consider:

- Dependency review and pinning
- Internal artifact mirroring
- Reproducible build procedures where possible
- Checksum verification of release artifacts
- Separate approval of the application and the local model runtime

## Vulnerability Disclosure

### Reporting Security Issues

If you discover a security vulnerability in Code Summarizer:

- Do **not** open a public GitHub issue for sensitive vulnerabilities
- Report privately to: `sekacorn@gmail.com`

Please include:

- Description of the issue
- Steps to reproduce
- Potential impact
- Affected version or commit
- Suggested fix, if available

### Response Targets

Best-effort response goals:

- Initial response: within 7 days
- Triage update: within 14 days
- Fix timeline: depends on severity, complexity, and maintainer availability

These targets are goals, not a contractual SLA.

## Security Best Practices

### For Individual Developers

- Keep secret masking enabled unless you have a specific reason not to
- Use Sensitive Mode when working with higher-risk snippets
- Paste only the minimum code needed for analysis
- Avoid pasting production secrets, even into local tools
- Review model output before relying on it
- Use approved local models only

### For Teams and Administrators

- Review the repository before deployment
- Maintain an approved version list
- Restrict installation to managed endpoints when appropriate
- Validate local model provenance
- Monitor for dependency updates and security advisories
- Re-test the application after upgrades

## Contact

For security-related questions:

- Email: `sekacorn@gmail.com`

For general project issues that are not security-sensitive:

- Use GitHub Issues
