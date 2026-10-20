import { documents } from "../../document";
import { getCursorContext } from "../../lib/context";
import { AttributeType, ElementKind, attributes, elements, getAttributeConfig, } from "../../lib/schema";
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
      items: Object.entries(elements).map(([name, config]) => ({
        label: name,
        insertText: elementSnippet(name, config.kind),
        insertTextFormat: 2,
        detail: config.kind,
      })),
    };
  }

  if (ctx.kind === "attribute") {
    const element = elements[ctx.element as keyof typeof elements];

    if (!element)
      return { isIncomplete: false, items: [] };

    return {
      isIncomplete: false,
      items: element.attributes.map(name => {
        const config = getAttributeConfig(name);

        return {
          label: name,
          insertText: `${name}="\${1}"\$0`,
          insertTextFormat: 2,
          detail: config ? config.description : `attribute for <${ctx.element}>`,
        };
      }),
    };
  }

  if (ctx.kind === "value") {
    if (!(ctx.attribute in attributes))
      return { isIncomplete: false, items: [] };

    const config = getAttributeConfig(
      ctx.attribute as keyof typeof attributes
    );

    if (!config) { return null; }

    if (config.type === AttributeType.COLOR) {
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

    if (config.type === AttributeType.ENUM && config.values) {
      return {
        isIncomplete: false,
        items: config.values.map(label => ({
          label,
          insertText: label,
          insertTextFormat: 1,
        })),
      };
    }
  }
  return { isIncomplete: false, items: [] };
};