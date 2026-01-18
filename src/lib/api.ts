import { invoke } from "@tauri-apps/api/tauri";
import type { SecretScanResult, SummarizeResponse } from "./schemas";

/**
 * Lists available Ollama models from localhost
 */
export async function listOllamaModels(): Promise<string[]> {
  try {
    const models = await invoke<string[]>("list_ollama_models");
    return models;
  } catch (error) {
    throw new Error(String(error));
  }
}

/**
 * Scans code for potential secrets
 */
export async function scanSecrets(code: string): Promise<SecretScanResult> {
  try {
    const result = await invoke<SecretScanResult>("scan_secrets", { code });
    return result;
  } catch (error) {
    throw new Error(String(error));
  }
}

/**
 * Summarizes code using the local LLM
 */
export async function summarizeCode(
  language: string,
  code: string,
  model: string,
  mode: string,
  redact: boolean
): Promise<SummarizeResponse> {
  try {
    const result = await invoke<SummarizeResponse>("summarize_code", {
      language,
      code,
      model,
      mode,
      redact,
    });
    return result;
  } catch (error) {
    throw new Error(String(error));
  }
}
