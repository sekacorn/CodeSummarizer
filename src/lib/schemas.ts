import { z } from "zod";

// Schema for risk items
export const RiskSchema = z.object({
  level: z.enum(["high", "medium", "low"]),
  item: z.string(),
});

export type Risk = z.infer<typeof RiskSchema>;

// Schema for syntax errors (validate mode)
export const SyntaxErrorSchema = z.object({
  line: z.number().int().nullable().optional(),
  column: z.number().int().nullable().optional(),
  message: z.string(),
  severity: z.enum(["error", "warning"]),
});

export type SyntaxError = z.infer<typeof SyntaxErrorSchema>;

// Main output schema from the model
export const CodeAnalysisSchema = z.object({
  summary: z.array(z.string()),
  walkthrough: z.array(z.string()),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
  side_effects: z.array(z.string()),
  risks: z.array(RiskSchema),
  junior_explanation: z.string(),
  confidence: z.number().min(0).max(1),
  // validate mode fields (optional so other modes still parse)
  is_valid: z.boolean().optional(),
  syntax_errors: z.array(SyntaxErrorSchema).optional(),
});

export type CodeAnalysis = z.infer<typeof CodeAnalysisSchema>;

// Secret finding type (from Rust backend)
export interface SecretFinding {
  kind: string;
  start: number;
  preview: string;
}

// Secret scan result (from Rust backend)
export interface SecretScanResult {
  findings: SecretFinding[];
}

// Summarize response (from Rust backend)
export interface SummarizeResponse {
  model_output: string;
  redacted: boolean;
  findings: SecretFinding[];
}

// Helper to parse and validate model output
export function parseModelOutput(jsonString: string): {
  success: boolean;
  data?: CodeAnalysis;
  error?: string;
} {
  try {
    // Try to extract JSON if it's wrapped in markdown code blocks
    let cleanedJson = jsonString.trim();

    // Remove markdown code fences if present
    if (cleanedJson.startsWith("```")) {
      const lines = cleanedJson.split("\n");
      cleanedJson = lines.slice(1, -1).join("\n");
    }

    // Remove "json" language identifier if present
    if (cleanedJson.startsWith("json")) {
      cleanedJson = cleanedJson.substring(4).trim();
    }

    const parsed = JSON.parse(cleanedJson);
    const validated = CodeAnalysisSchema.parse(parsed);

    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Schema validation failed: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
      };
    } else if (error instanceof SyntaxError) {
      return {
        success: false,
        error: `JSON parsing failed: ${error.message}`,
      };
    } else {
      return {
        success: false,
        error: `Unknown error: ${String(error)}`,
      };
    }
  }
}
