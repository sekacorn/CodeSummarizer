// Supported programming languages
export const SUPPORTED_LANGUAGES = [
  "Java",
  "Python",
  "JavaScript",
  "SQL",
  "VBA",
  "JSON",
  "CSS",
  "DAX",
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Analysis modes
export const ANALYSIS_MODES = {
  SUMMARIZE: "summarize",
  JUNIOR: "junior",
  RISK: "risk",
  VALIDATE: "validate",
} as const;

export type AnalysisMode = typeof ANALYSIS_MODES[keyof typeof ANALYSIS_MODES];
