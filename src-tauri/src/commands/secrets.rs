use regex::Regex;
use super::types::{SecretFinding, SecretScanResult};

/// Scans code for potential secrets using regex patterns
pub fn scan_for_secrets(code: &str) -> SecretScanResult {
    let mut findings = Vec::new();

    // AWS Access Key pattern
    let aws_pattern = Regex::new(r"AKIA[0-9A-Z]{16}").unwrap();
    for mat in aws_pattern.find_iter(code) {
        findings.push(SecretFinding {
            kind: "AWS Access Key".to_string(),
            start: mat.start(),
            preview: format!("{}...", &mat.as_str()[..8]),
        });
    }

    // JWT Token pattern (three base64url segments separated by dots)
    let jwt_pattern = Regex::new(r"eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+").unwrap();
    for mat in jwt_pattern.find_iter(code) {
        findings.push(SecretFinding {
            kind: "JWT Token".to_string(),
            start: mat.start(),
            preview: format!("{}...", &mat.as_str()[..20]),
        });
    }

    // Password/Secret/API Key assignments
    let cred_pattern = Regex::new(
        r#"(?i)(password|secret|api_key|apikey|access_token|private_key)\s*[=:]\s*["']([^"']{8,})["']"#
    ).unwrap();
    for caps in cred_pattern.captures_iter(code) {
        if let Some(mat) = caps.get(0) {
            let key_type = caps.get(1).map(|m| m.as_str()).unwrap_or("credential");
            findings.push(SecretFinding {
                kind: format!("{} assignment", key_type),
                start: mat.start(),
                preview: format!("{}=***", key_type),
            });
        }
    }

    // PEM private key blocks
    let pem_pattern = Regex::new(r"-----BEGIN (RSA |EC )?PRIVATE KEY-----").unwrap();
    for mat in pem_pattern.find_iter(code) {
        findings.push(SecretFinding {
            kind: "PEM Private Key".to_string(),
            start: mat.start(),
            preview: "-----BEGIN PRIVATE KEY-----".to_string(),
        });
    }

    // Bearer tokens in Authorization headers
    let bearer_pattern = Regex::new(r"(?i)authorization:\s*bearer\s+([a-zA-Z0-9_\-\.]{20,})").unwrap();
    for mat in bearer_pattern.find_iter(code) {
        findings.push(SecretFinding {
            kind: "Bearer Token".to_string(),
            start: mat.start(),
            preview: "Authorization: Bearer ***".to_string(),
        });
    }

    SecretScanResult { findings }
}

/// Redacts secrets from code by replacing them with ***REDACTED***
pub fn redact_secrets(code: &str, findings: &[SecretFinding]) -> String {
    if findings.is_empty() {
        return code.to_string();
    }

    // Sort findings by start position in reverse order to maintain indices
    let mut sorted_findings = findings.to_vec();
    sorted_findings.sort_by(|a, b| b.start.cmp(&a.start));

    let mut redacted = code.to_string();

    // Redact each finding
    // We need to find the actual secret span for each finding
    for finding in sorted_findings {
        let start = finding.start;

        // Find the end of the secret based on the type
        if finding.kind.contains("AWS") {
            // AWS keys are 20 chars (AKIA + 16)
            if start + 20 <= redacted.len() {
                redacted.replace_range(start..start + 20, "***REDACTED***");
            }
        } else if finding.kind.contains("JWT") {
            // Find the end of the JWT token
            if let Some(remaining) = redacted.get(start..) {
                if let Some(end_offset) = remaining.find(|c: char| !c.is_alphanumeric() && c != '_' && c != '-' && c != '.') {
                    redacted.replace_range(start..start + end_offset, "***REDACTED***");
                } else {
                    // JWT extends to end of string
                    redacted.replace_range(start.., "***REDACTED***");
                }
            }
        } else if finding.kind.contains("assignment") {
            // Find the quoted value and redact it
            if let Some(remaining) = redacted.get(start..) {
                if let Some(quote_start) = remaining.find(|c| c == '"' || c == '\'') {
                    let quote_char = remaining.chars().nth(quote_start).unwrap();
                    if let Some(value_start) = remaining.get(quote_start + 1..) {
                        if let Some(quote_end) = value_start.find(quote_char) {
                            let actual_start = start + quote_start + 1;
                            let actual_end = actual_start + quote_end;
                            if actual_end <= redacted.len() {
                                redacted.replace_range(actual_start..actual_end, "***REDACTED***");
                            }
                        }
                    }
                }
            }
        } else if finding.kind.contains("PEM") {
            // Redact entire PEM block
            if let Some(remaining) = redacted.get(start..) {
                if let Some(end_offset) = remaining.find("-----END") {
                    if let Some(final_end) = remaining.get(end_offset..).and_then(|s| s.find("-----")) {
                        let actual_end = start + end_offset + final_end + 5;
                        if actual_end <= redacted.len() {
                            redacted.replace_range(start..actual_end, "***REDACTED PEM KEY***");
                        }
                    }
                }
            }
        } else if finding.kind.contains("Bearer") {
            // Find the bearer token value
            if let Some(remaining) = redacted.get(start..) {
                if let Some(bearer_pos) = remaining.to_lowercase().find("bearer") {
                    let token_start = start + bearer_pos + 6; // "bearer" length
                    if let Some(token_str) = redacted.get(token_start..) {
                        // Skip whitespace
                        let ws_offset = token_str.chars().take_while(|c| c.is_whitespace()).count();
                        let actual_token_start = token_start + ws_offset;

                        // Find end of token
                        if let Some(rest) = redacted.get(actual_token_start..) {
                            let token_len = rest.chars()
                                .take_while(|c| c.is_alphanumeric() || *c == '_' || *c == '-' || *c == '.')
                                .count();
                            if token_len > 0 {
                                let actual_end = actual_token_start + token_len;
                                if actual_end <= redacted.len() {
                                    redacted.replace_range(actual_token_start..actual_end, "***REDACTED***");
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    redacted
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scan_aws_key() {
        let code = "const key = 'AKIAIOSFODNN7EXAMPLE';";
        let result = scan_for_secrets(code);
        assert_eq!(result.findings.len(), 1);
        assert_eq!(result.findings[0].kind, "AWS Access Key");
    }

    #[test]
    fn test_redact_secrets() {
        let code = "const key = 'AKIAIOSFODNN7EXAMPLE';";
        let scan_result = scan_for_secrets(code);
        let redacted = redact_secrets(code, &scan_result.findings);
        assert!(redacted.contains("***REDACTED***"));
        assert!(!redacted.contains("AKIAIOSFODNN7EXAMPLE"));
    }
}
