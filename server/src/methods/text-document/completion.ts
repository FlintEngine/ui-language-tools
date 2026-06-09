import { documents } from "../../document";
import { getCursorContext } from "../../lib/context";
import { schema, ElementKind } from "../../lib/schema";
import log from "../../log";
import { RequestMessage, TextDocumentIdentifier } from "../../types/types";


type CompletionItem = {
  label: string;
  insertText?: string;
  insertTextFormat?: number; // 1 = PlainText, 2 = Snippet
  detail?: string;
  kind?: number;
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

function elementSnippet(name: string, kind: ElementKind): string {
  switch (kind) {
    case "self-closing": return `${name} \${1} />\$0`;
    case "inline": return `${name}>\${1}</${name}>\$0`;
    case "block": return `${name}>\n  \${1}\n</${name}>\$0`;
  }
}

// Engine preset colors sourced from Colors namespace in the C++ header.
const ENGINE_COLORS: ReadonlyArray<[string, string, string | null]> = [
  ["white", "white", "#ffffff"],
  ["black", "black", "#000000"],
  ["red", "red", "#ff0000"],
  ["green", "green  #00ff00", "#00ff00"],
  ["blue", "blue", "#0000ff"],
  ["yellow", "yellow", "#ffff00"],
  ["cyan", "cyan", "#00ffff"],
  ["magenta", "magenta", "#ff00ff"],
  ["transparent", "transparent", null],
];

export const completion = (message: RequestMessage): CompletionList | null => {
  const params = message.params as CompletionParams;
  const content = documents.get(params.textDocument.uri);

  if (!content) return null;

  const normalized = content.replace(/\r\n/g, "\n");

  const lines = normalized.split("\n");
  const linesUpToCursor = lines.slice(0, params.position.line);

  const absoluteOffset =
    linesUpToCursor.join("\n").length +
    (linesUpToCursor.length > 0 ? 1 : 0) +
    params.position.character;

  const textUpToCursor = normalized.slice(0, absoluteOffset);
  const ctx = getCursorContext(textUpToCursor);

  log.write({ completion: { context: ctx } });

  if (ctx.kind === "element") {
    return {
      isIncomplete: false,
      items: schema.elements.map(name => {
        const kind = schema.elementKinds[name] ?? "self-closing";
        return {
          label: name,
          insertText: elementSnippet(name, kind),
          insertTextFormat: 2, detail: kind,
        };
      }),
    };
  }

  if (ctx.kind === "attribute") {
    const attrs = schema.attributes[ctx.element] ?? [];
    return {
      isIncomplete: false,
      items: attrs.map(name => ({
        label: name,
        insertText: `${name}="\${1}"\$0`,
        insertTextFormat: 2,
        detail: `attribute for <${ctx.element}>`
      }))
    };
  }

  if (ctx.kind === "value") {
    const isColorAttribute = ctx.attribute.toLowerCase().includes("color");

    if (isColorAttribute) {
      const COLOR_KIND = 16;

      const colorSnippets: CompletionItem[] = [
        {
          label: "#ffffff (Hex Code)",
          insertText: "#${1:ffffff}",
          insertTextFormat: 2,
          detail: "Hexadecimal color formatting",
          kind: COLOR_KIND,
        },
        {
          label: "rgb(...) (RGB Components)",
          insertText: "rgb(${1:255}, ${2:255}, ${3:255})",
          insertTextFormat: 2,
          detail: "Engine component vec3 channels",
        },
        {
          label: "rgba(...) (RGBA Components)",
          insertText: "rgba(${1:255}, ${2:255}, ${3:255}, ${4:1.0})",
          insertTextFormat: 2,
          detail: "Engine component vec4 channels",
        },
        ...ENGINE_COLORS.map(([insertText, label, hex]) => ({
          label,
          insertText,
          insertTextFormat: 1 as const,
          detail: hex ?? "rgba(0, 0, 0, 0)",
          ...(hex !== null ? { kind: COLOR_KIND } : {}),
        })),
      ];
      return { isIncomplete: false, items: colorSnippets };
    }


    const values = schema.values[ctx.attribute] ?? [];
    return {
      isIncomplete: false,
      items: values.map(label => ({ label, insertTextFormat: 2 }))
    };
  }

  return { isIncomplete: false, items: [] };
};