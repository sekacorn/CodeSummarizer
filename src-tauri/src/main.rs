// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::{
    scan_for_secrets, redact_secrets, list_models, generate_completion, build_prompt,
    SecretScanResult, SummarizeResponse,
};

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
) -> Result<SummarizeResponse, String> {
    // First, scan for secrets
    let scan_result = scan_for_secrets(&code);

    // Prepare the code (redact if requested and secrets found)
    let code_to_send = if redact && !scan_result.findings.is_empty() {
        redact_secrets(&code, &scan_result.findings)
    } else {
        code.clone()
    };

    // Build the prompt based on mode
    let prompt = build_prompt(&language, &mode, &code_to_send);

    // Call Ollama to generate the response
    let model_output = generate_completion(&model, &prompt)?;

    // Return the response with metadata
    Ok(SummarizeResponse {
        model_output,
        redacted: redact && !scan_result.findings.is_empty(),
        findings: scan_result.findings,
    })
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
