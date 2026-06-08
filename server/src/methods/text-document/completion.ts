import { documents } from "../../document";
import { getCursorContext } from "../../lib/context";
import { schema } from "../../lib/schema";
import log from "../../log";
import { RequestMessage, TextDocumentIdentifier } from "../../types/types";

type CompletionItem = {
  label: string;
};

export interface CompletionList {
  isIncomplete: boolean;
  items: CompletionItem[];
}

interface Position {
  line: number;
  character: number;
}

interface TextDocumentPositionParams {
  textDocument: TextDocumentIdentifier;
  position: Position;
}

export interface CompletionParams extends TextDocumentPositionParams { }

export const completion = (message: RequestMessage): CompletionList | null => {
  const params = message.params as CompletionParams;
  const content = documents.get(params.textDocument.uri);

  if (!content) return null;

  const currentLine = content.split("\n")[params.position.line];
  const ctx = getCursorContext(currentLine, params.position.character);

  log.write({ completion: { currentLine, context: ctx } });

  if (ctx.kind === "element") {
    return { isIncomplete: false, items: schema.elements.map(label => ({ label })) };
  }
  if (ctx.kind === "attribute") {
    const attrs = schema.attributes[ctx.element] ?? [];
    return { isIncomplete: false, items: attrs.map(label => ({ label })) };
  }
  if (ctx.kind === "value") {
    const values = schema.values[ctx.attribute] ?? [];
    return { isIncomplete: false, items: values.map(label => ({ label })) };
  }

  return { isIncomplete: false, items: [] };
};