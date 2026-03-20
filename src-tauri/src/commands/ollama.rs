use reqwest::blocking::Client;
use std::time::Duration;
use super::types::{OllamaModelsResponse, OllamaGenerateRequest, OllamaGenerateResponse};

const OLLAMA_BASE_URL: &str = "http://127.0.0.1:11434";
const REQUEST_TIMEOUT_SECS: u64 = 120;

/// Lists available models from Ollama
pub fn list_models() -> Result<Vec<String>, String> {
    // Short timeout: listing models is a fast metadata call, not an inference request
    let client = Client::builder()
        .timeout(Duration::from_secs(5))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let url = format!("{}/api/tags", OLLAMA_BASE_URL);

    let response = client
        .get(&url)
        .send()
        .map_err(|e| {
            if e.is_connect() {
                "Ollama is not running. Please start Ollama and try again.".to_string()
            } else if e.is_timeout() {
                "Request to Ollama timed out. Check if Ollama is responsive.".to_string()
            } else {
                format!("Failed to connect to Ollama: {}", e)
            }
        })?;

    if !response.status().is_success() {
        return Err(format!("Ollama returned error status: {}", response.status()));
    }

    let models_response: OllamaModelsResponse = response
        .json()
        .map_err(|e| format!("Failed to parse Ollama response: {}", e))?;

    let model_names: Vec<String> = models_response
        .models
        .into_iter()
        .map(|m| m.name)
        .collect();

    if model_names.is_empty() {
        return Err("No models found. Please pull a model using 'ollama pull <model-name>'.".to_string());
    }

    Ok(model_names)
}

/// Generates a completion from Ollama
pub fn generate_completion(model: &str, prompt: &str) -> Result<String, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(REQUEST_TIMEOUT_SECS))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let url = format!("{}/api/generate", OLLAMA_BASE_URL);

    let request_body = OllamaGenerateRequest {
        model: model.to_string(),
        prompt: prompt.to_string(),
        stream: false, // Wait for the full response rather than streaming tokens back incrementally
    };

    let response = client
        .post(&url)
        .json(&request_body)
        .send()
        .map_err(|e| {
            if e.is_connect() {
                "Ollama is not running. Please start Ollama and try again.".to_string()
            } else if e.is_timeout() {
                "Request to Ollama timed out. The model may be too large or your system may be slow. Try a smaller model.".to_string()
            } else {
                format!("Failed to generate completion: {}", e)
            }
        })?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().unwrap_or_default();

        if status.as_u16() == 404 {
            return Err(format!(
                "Model '{}' not found. Please pull it using 'ollama pull {}'.",
                model, model
            ));
        }

        return Err(format!("Ollama returned error {}: {}", status, error_text));
    }

    let generate_response: OllamaGenerateResponse = response
        .json()
        .map_err(|e| format!("Failed to parse Ollama response: {}", e))?;

    Ok(generate_response.response)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[ignore] // Requires Ollama to be running
    fn test_list_models() {
        let result = list_models();
        assert!(result.is_ok());
    }

    #[test]
    #[ignore] // Requires Ollama to be running
    fn test_generate_completion() {
        let result = generate_completion("llama2", "Say hello");
        assert!(result.is_ok());
    }
}
