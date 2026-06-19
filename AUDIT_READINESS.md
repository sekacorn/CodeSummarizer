# Audit Readiness

This repository provides review inputs, not an independent audit or certification.

## Review evidence

- Application dependencies are pinned by `package-lock.json` and `src-tauri/Cargo.lock`.
- `npm run verify` runs Vitest schema/language tests, strict TypeScript compilation, the Vite production build, Rust unit tests (including secret scanning/redaction), and release-configuration invariants.
- `.github/workflows/windows-release.yml` performs the same checks before producing artifacts.
- Every release build emits `SHA256SUMS.txt`.
- Network flow, privacy assumptions, threats, and restricted-deployment controls are documented separately.

## Reviewer checklist

Record the Git commit and version; verify lockfiles and workflow logs; inventory Node and Rust dependencies; review Tauri allowlist/CSP and the fixed Ollama endpoint; exercise redaction and Sensitive Mode; scan installers; verify checksums; assess signing status; review Ollama and model provenance separately; and retain build logs under the organization's evidence policy.

## Gaps requiring organizational action

There is no SBOM, reproducible-build guarantee, external penetration test, Authenticode certificate, formal secure-development attestation, centralized audit log, or accreditation package. Organizations must decide whether to add those controls before approval.
