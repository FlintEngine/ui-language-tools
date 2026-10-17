import { documents } from "../../document";
import { checkClosing, scanTags } from "../../lib/validation/tags";
import { validateTags } from "../../lib/validation/validators";
import { Diagnostic, DocumentDiagnosticParams, FullDocumentDiagnosticReport } from "../../types/diagnostics-types";
import { Range, RequestMessage, TextDocumentIdentifier } from "../../types/types";


export const diagnostic = (message: RequestMessage): FullDocumentDiagnosticReport | null => {
  const params = message.params as DocumentDiagnosticParams;
  const content = documents.get(params.textDocument.uri);
  if (!content) return null;

  const normalized = content.replace(/\r\n/g, "\n");
  const tags = scanTags(normalized);

  const items: Diagnostic[] = [
    ...validateTags(tags),
    ...checkClosing(tags),
  ];

  return { kind: "full", items };
};