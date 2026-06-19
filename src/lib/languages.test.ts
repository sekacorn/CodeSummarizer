import { describe, expect, it } from "vitest";
import { SUPPORTED_LANGUAGES } from "./languages";

describe("SUPPORTED_LANGUAGES", () => {
  it("contains every documented language exactly once", () => {
    const expected = [
      "Java", "Python", "JavaScript", "SQL", "VBA", "JSON", "CSS", "DAX",
      "C", "C++", "C#", "Assembly", "Fortran", "COBOL", "BASH", "PL/SQL",
      "T-SQL", "SAS", "R", "MATLAB", "VHDL", "Verilog", "SystemVerilog",
      "VB.NET", "Pascal", "Delphi/Object Pascal", "ABAP", "XML", "XSLT",
      "Terraform/HCL",
    ];

    expect(SUPPORTED_LANGUAGES).toEqual(expected);
    expect(new Set(SUPPORTED_LANGUAGES).size).toBe(SUPPORTED_LANGUAGES.length);
  });
});
