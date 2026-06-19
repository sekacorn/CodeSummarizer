# Restricted Deployment Guidance

Code Summarizer is a candidate for local restricted workflows; it is not pre-authorized for classified, regulated, or mission systems.

## Promotion process

1. Select and record an approved source commit.
2. Mirror and review JavaScript crates, Rust crates, Tauri build tools, WebView2, Ollama, and model artifacts.
3. Build on a controlled Windows runner and retain logs and `SHA256SUMS.txt`.
4. Malware-scan and, where required, Authenticode-sign the executable and installers.
5. Confirm host firewall policy and verify traffic is limited to `127.0.0.1:11434` during operation.
6. Install an approved Ollama version and approved model separately.
7. Test secret patterns and representative false positives/negatives.
8. Enable Sensitive Mode for higher-risk use and apply operating-system clipboard, screen-capture, memory-dump, and endpoint-monitoring policy.

## Operational limits

The app has no identity, role-based access control, central policy enforcement, audit trail, remote administration, or authenticated Ollama channel. Local administrators and endpoint tools can observe process data. LLM output is advisory and must not replace compilers, security review, or human approval.

For disconnected deployment, transfer the MSI/NSIS artifact, checksum manifest, approved Ollama installer, and approved model files through the organization's controlled media process. The app installer includes WebView2 offline; model provisioning remains an independent step.
