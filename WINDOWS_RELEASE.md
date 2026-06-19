# Windows Release Guide

## Artifacts

`npm run tauri:build:windows` runs all checks and creates:

- NSIS `Setup.exe`: recommended interactive per-user installer
- MSI: useful for managed deployment and inventory
- Portable x64 ZIP: compiled executable, GPL license, and portable instructions
- `SHA256SUMS.txt`: SHA-256 digest for every release artifact

End users do not need Node.js or Rust. Ollama and at least one model are separate requirements and are never bundled. MSI and NSIS packages include Microsoft's offline WebView2 installer; the portable build expects WebView2 to be present.

## Local build

Use 64-bit Windows, Node.js 22, stable Rust with the MSVC target, Visual Studio Build Tools with Desktop development with C++, and internet access for the first dependency/tool download.

```powershell
npm ci
npm run verify
npm run tauri:build:windows
```

Artifacts are written to `artifacts`. The Rust executable is also in `src-tauri/target/release`.

## Installation and removal

Use the NSIS installer for a normal user installation. Use the MSI where organizational tooling requires Windows Installer. The NSIS package is configured per user and should not require administrator rights for the app itself; WebView2 installation behavior can depend on the machine state and Windows policy.

For managed MSI installation:

```powershell
msiexec /i .\CodeSummarizer_1.0.0_x64_en-US.msi /qn /norestart
```

Remove it from Windows Settings > Apps, or use the product-aware uninstall command supplied by deployment tooling.

## Signing

The project does not contain signing credentials. Public artifacts should ideally be Authenticode-signed and timestamped using protected CI secrets or a hardware/cloud signing service. SHA-256 checksums provide integrity verification but do not replace publisher authentication.

## Package-manager readiness

- **WinGet:** structurally suitable after a stable public release exists. Prefer the versioned MSI or silent-capable NSIS URL, immutable SHA-256, publisher metadata, and installer switches. Signing is strongly recommended.
- **Scoop:** suitable now for a portable manifest once a stable public release URL exists. The portable ZIP and checksum are the natural inputs.
- **Chocolatey:** technically suitable, but a package would need install/uninstall scripts, moderation metadata, checksum pinning, and ongoing maintenance. It is the least direct first target.

No package-manager submissions are performed by this repository workflow.
