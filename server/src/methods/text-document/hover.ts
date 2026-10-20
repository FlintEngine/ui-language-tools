import { documents } from "../../document";
import {
  AttributeName,
  AttributeType,
  ElementName,
  attributes,
  elements,
  getAttributeConfig,
  getElementConfig,
} from "../../lib/schema";
import {
  Position,
  RequestMessage,
  TextDocumentIdentifier,
} from "../../types/types";

interface HoverParams {
  textDocument: TextDocumentIdentifier;
  position: Position;
}

export interface HoverResult {
  contents: {
    kind: "markdown";
    value: string;
  };
}

function isAttributeName(name: string): name is AttributeName {
  return name in attributes;
}

function isElementName(name: string): name is ElementName {
  return name in elements;
}

function attributeTypeLabel(type: AttributeType): string {
  switch (type) {
    case AttributeType.COLOR: {
      return "color";
    }
    case AttributeType.ENUM: {
      return "enum";
    }
    case AttributeType.ID: {
      return "id";
    }
    case AttributeType.STRING: {
      return "string";
    }
    case AttributeType.NUMBER: {
      return "number";
    }
    case AttributeType.BOX: {
      return "box";
    }
    case AttributeType.PATH: {
      return "path";
    }
  }
}

export const hover = (message: RequestMessage): HoverResult | null => {
  const params = message.params as HoverParams;
  const content = documents.get(params.textDocument.uri);

  if (!content) {
    return null;
  }

  const normalized = content.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const line = lines[params.position.line];

  if (line === undefined) {
    return null;
  }

  const character = params.position.character;

  const attributeRegex = /([\w-]+)\s*=\s*"([^"]*)"/g;

  for (const match of line.matchAll(attributeRegex)) {
    if (match.index === undefined) {
      continue;
    }

    const attributeName = match[1];

    const nameStart = match.index;
    const nameEnd = nameStart + attributeName.length;

    if (character < nameStart || character > nameEnd) {
      continue;
    }

    if (!isAttributeName(attributeName)) {
      return null;
    }

    const config = getAttributeConfig(attributeName);
    if (!config) { return null };

    const sections = [
      `**${attributeName}**`,
      `Type: \`${attributeTypeLabel(config.type)}\``,
    ];

    if (config.description)
      sections.push(config.description);

    if (config.values?.length)
      sections.push(`Values: ${config.values.map(value => `\`${value}\``).join(", ")}`);

    return {
      contents: {
        kind: "markdown",
        value: sections.join("\n\n"),
      },
    };
  }

  const elementRegex = /<\/?([\w-]+)/g;

  for (const match of line.matchAll(elementRegex)) {
    if (match.index === undefined) {
      continue;
    }

    const elementName = match[1];

    const nameStart = match.index + (line[match.index + 1] === "/" ? 2 : 1);
    const nameEnd = nameStart + elementName.length;

    if (character < nameStart || character > nameEnd) {
      continue;
    }

    if (!isElementName(elementName)) {
      return null;
    }

    const config = getElementConfig(elementName);
    if (!config) { return null; }
    const sections = [
      `**${elementName}**`,
      `Kind: \`${config.kind}\``,
    ];

    if (config.description) {
      sections.push(config.description);
    }

    return {
      contents: {
        kind: "markdown",
        value: sections.join("\n\n"),
      },
    };
  }

  return null;
};