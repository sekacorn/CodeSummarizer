import { describe, it, expect } from "vitest";
import { parseModelOutput } from "./schemas";
import { SUPPORTED_LANGUAGES, ANALYSIS_MODES } from "./languages";

// Minimal valid analysis object the model is expected to return
const validAnalysis = {
  summary: ["Does something useful"],
  walkthrough: ["Step 1: start", "Step 2: finish"],
  inputs: ["param: string"],
  outputs: ["result: boolean"],
  side_effects: [],
  risks: [{ level: "low", item: "None identified" }],
  junior_explanation: "This code does a thing.",
  confidence: 0.9,
};

describe("parseModelOutput", () => {
  it("parses valid raw JSON", () => {
    const result = parseModelOutput(JSON.stringify(validAnalysis));
    expect(result.success).toBe(true);
    expect(result.data?.summary).toEqual(["Does something useful"]);
    expect(result.data?.confidence).toBe(0.9);
  });

  it("parses JSON wrapped in triple-backtick code fence", () => {
    const input = "```\n" + JSON.stringify(validAnalysis) + "\n```";
    const result = parseModelOutput(input);
    expect(result.success).toBe(true);
  });

  it("parses JSON wrapped in ```json code fence", () => {
    const input = "```json\n" + JSON.stringify(validAnalysis) + "\n```";
    const result = parseModelOutput(input);
    expect(result.success).toBe(true);
  });

  it("trims leading and trailing whitespace before parsing", () => {
    const result = parseModelOutput("   \n" + JSON.stringify(validAnalysis) + "\n   ");
    expect(result.success).toBe(true);
  });

  it("returns error on invalid JSON", () => {
    const result = parseModelOutput("this is not json");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns error when required fields are missing", () => {
    const incomplete = { summary: ["only this"] };
    const result = parseModelOutput(JSON.stringify(incomplete));
    expect(result.success).toBe(false);
    expect(result.error).toContain("Schema validation failed");
  });

  it("returns error when risk level is invalid", () => {
    const bad = {
      ...validAnalysis,
      risks: [{ level: "critical", item: "bad level" }],
    };
    const result = parseModelOutput(JSON.stringify(bad));
    expect(result.success).toBe(false);
  });

  it("returns error when confidence is out of range", () => {
    const bad = { ...validAnalysis, confidence: 1.5 };
    const result = parseModelOutput(JSON.stringify(bad));
    expect(result.success).toBe(false);
  });

  it("accepts validate mode fields (is_valid + syntax_errors)", () => {
    const validateOutput = {
      ...validAnalysis,
      is_valid: false,
      syntax_errors: [
        { line: 3, column: 10, message: "Missing semicolon", severity: "error" },
        { line: null, column: null, message: "Unused variable", severity: "warning" },
      ],
    };
    const result = parseModelOutput(JSON.stringify(validateOutput));
    expect(result.success).toBe(true);
    expect(result.data?.is_valid).toBe(false);
    expect(result.data?.syntax_errors).toHaveLength(2);
    expect(result.data?.syntax_errors?.[0].line).toBe(3);
    expect(result.data?.syntax_errors?.[1].line).toBeNull();
  });

  it("accepts validate mode with is_valid true and empty syntax_errors", () => {
    const validateOutput = {
      ...validAnalysis,
      is_valid: true,
      syntax_errors: [],
    };
    const result = parseModelOutput(JSON.stringify(validateOutput));
    expect(result.success).toBe(true);
    expect(result.data?.is_valid).toBe(true);
    expect(result.data?.syntax_errors).toHaveLength(0);
  });

  it("rejects syntax_errors with invalid severity", () => {
    const bad = {
      ...validAnalysis,
      is_valid: false,
      syntax_errors: [{ line: 1, column: 1, message: "oops", severity: "critical" }],
    };
    const result = parseModelOutput(JSON.stringify(bad));
    expect(result.success).toBe(false);
  });

  it("is_valid and syntax_errors are optional (non-validate modes still parse)", () => {
    // Regular summarize output without validate fields should still parse fine
    const result = parseModelOutput(JSON.stringify(validAnalysis));
    expect(result.success).toBe(true);
    expect(result.data?.is_valid).toBeUndefined();
    expect(result.data?.syntax_errors).toBeUndefined();
  });
});

describe("SUPPORTED_LANGUAGES", () => {
  it("includes all required languages", () => {
    expect(SUPPORTED_LANGUAGES).toContain("SQL");
    expect(SUPPORTED_LANGUAGES).toContain("VBA");
    expect(SUPPORTED_LANGUAGES).toContain("JSON");
    expect(SUPPORTED_LANGUAGES).toContain("DAX");
    expect(SUPPORTED_LANGUAGES).toContain("JavaScript");
    expect(SUPPORTED_LANGUAGES).toContain("Python");
  });

  it("does not contain the old Visual Basic name", () => {
    expect(SUPPORTED_LANGUAGES).not.toContain("Visual Basic");
  });
});

describe("ANALYSIS_MODES", () => {
  it("includes all four modes", () => {
    expect(ANALYSIS_MODES.SUMMARIZE).toBe("summarize");
    expect(ANALYSIS_MODES.JUNIOR).toBe("junior");
    expect(ANALYSIS_MODES.RISK).toBe("risk");
    expect(ANALYSIS_MODES.VALIDATE).toBe("validate");
  });
});
