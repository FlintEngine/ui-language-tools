import { Range, TextDocumentIdentifier } from "./types";
export namespace DiagnosticSeverity {
  export const Error: 1 = 1;
  export const Warning: 2 = 2;
  export const Information: 3 = 3;
  export const Hint: 4 = 4;
}

export type DiagnosticSeverity = 1 | 2 | 3 | 4;

export interface Diagnostic {
  range: Range;
  severity?: DiagnosticSeverity;
  // code?: number | string;
  // codeDescription?: CodeDescription;
  source: "Flint UI Language Server";
  message: string;
  // tags?: DiagnosticTag[];
  // relatedInformation?: DiagnosticRelatedInformation[];
  data?: unknown;
}


export interface DocumentDiagnosticParams {
  textDocument: TextDocumentIdentifier
}


export interface FullDocumentDiagnosticReport {
  kind: "full";
  resultId?: string;
  items: Diagnostic[];
}
