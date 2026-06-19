// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::{
    build_prompt, generate_completion, list_models, redact_secrets, scan_for_secrets,
    SecretScanResult, SummarizeResponse,
};

fn prepare_code(code: &str, redact: bool, sensitive_mode: bool) -> (String, SecretScanResult) {
    let scan_result = scan_for_secrets(code);
    let should_redact = redact || sensitive_mode;
    let code_to_send = if should_redact && !scan_result.findings.is_empty() {
        redact_secrets(code, &scan_result.findings)
    } else {
        code.to_string()
    };
    (code_to_send, scan_result)
}

/// Lists available Ollama models
#[tauri::command]
fn list_ollama_models() -> Result<Vec<String>, String> {
    list_models()
}

/// Scans code for potential secrets
#[tauri::command]
fn scan_secrets(code: String) -> Result<SecretScanResult, String> {
    Ok(scan_for_secrets(&code))
}

/// Summarizes code using a local LLM via Ollama
#[tauri::command]
fn summarize_code(
    language: String,
    code: String,
    model: String,
    mode: String,
    redact: bool,
    sensitive_mode: bool,
) -> Result<SummarizeResponse, String> {
    const SUPPORTED_LANGUAGES: &[&str] = &[
        "Java",
        "Python",
        "JavaScript",
        "SQL",
        "VBA",
        "JSON",
        "CSS",
        "DAX",
        "C",
        "C++",
        "C#",
        "Assembly",
        "Fortran",
        "COBOL",
        "BASH",
        "PL/SQL",
        "T-SQL",
        "SAS",
        "R",
        "MATLAB",
        "VHDL",
        "Verilog",
        "SystemVerilog",
        "VB.NET",
        "Pascal",
        "Delphi/Object Pascal",
        "ABAP",
        "XML",
        "XSLT",
        "Terraform/HCL",
    ];
    const SUPPORTED_MODES: &[&str] = &["summarize", "junior", "risk", "validate"];

    if !SUPPORTED_LANGUAGES.contains(&language.as_str()) {
        return Err("Unsupported language selection.".to_string());
    }
    if !SUPPORTED_MODES.contains(&mode.as_str()) {
        return Err("Unsupported analysis mode.".to_string());
    }
    if code.trim().is_empty() || model.trim().is_empty() {
        return Err("Code and model are required.".to_string());
    }

    // Sensitive Mode is enforced here, not only by the frontend toggle.
    let should_redact = redact || sensitive_mode;
    let (code_to_send, scan_result) = prepare_code(&code, redact, sensitive_mode);

    // Build the prompt based on mode
    let prompt = build_prompt(&language, &mode, &code_to_send);

    // Call Ollama to generate the response
    let model_output = generate_completion(&model, &prompt)?;

    // Return the response with metadata
    Ok(SummarizeResponse {
        model_output,
        redacted: should_redact && !scan_result.findings.is_empty(),
        findings: scan_result.findings,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sensitive_mode_enforces_redaction() {
        let secret = "password = \"supersecret123\"";
        let (prepared, findings) = prepare_code(secret, false, true);
        assert!(!findings.findings.is_empty());
        assert!(prepared.contains("***REDACTED***"));
        assert!(!prepared.contains("supersecret123"));
    }

    #[test]
    fn normal_mode_respects_disabled_redaction() {
        let secret = "password = \"supersecret123\"";
        let (prepared, _) = prepare_code(secret, false, false);
        assert_eq!(prepared, secret);
    }

    #[test]
    fn rejects_unknown_language_before_contacting_ollama() {
        let result = summarize_code(
            "Unknown".into(),
            "x".into(),
            "model".into(),
            "summarize".into(),
            true,
            false,
        );
        assert_eq!(result.unwrap_err(), "Unsupported language selection.");
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            list_ollama_models,
            scan_secrets,
            summarize_code
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
