# Release Notes

## 1.0.0 - Windows release candidate

- Added prompt-based analysis selections for PL/SQL, T-SQL, SAS, R, MATLAB, VHDL, Verilog, SystemVerilog, VB.NET, Pascal, Delphi/Object Pascal, ABAP, XML, XSLT, and Terraform/HCL.
- Added supported Tauri MSI and NSIS packaging plus a portable Windows ZIP.
- Added offline WebView2 installation for installer packages.
- Added release metadata, installer icon configuration, SHA-256 generation, and reproducible Rust lockfile handling.
- Hardened Sensitive Mode with backend redaction enforcement and disabled clipboard/raw-output UI paths.
- Added manually triggered Windows CI and automatic tagged GitHub Releases with generated notes.
- Expanded installation, troubleshooting, privacy, security, threat-model, audit, and restricted-deployment guidance.

Known release consideration: artifacts are unsigned unless the release page explicitly documents an Authenticode signature. Ollama and local model downloads remain separate requirements.
