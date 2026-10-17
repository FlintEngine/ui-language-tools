import { Diagnostic, DiagnosticSeverity } from "../../types/diagnostics-types";

export function makeDiagnostic(
  line: number,
  col: number,
  length: number,
  severity: DiagnosticSeverity,
  message: string
): Diagnostic {
  return {
    severity,
    source: "Flint UI Language Server",
    message,
    range: {
      start: { line, character: col },
      end: { line, character: col + length },
    },
  };
}