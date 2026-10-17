import { Diagnostic, DiagnosticSeverity } from "../../types/diagnostics-types";
import { TagToken } from "../../types/tags-types";
import { AttributeType, schema } from "../schema";
import { closestMatch } from "./close-match";
import { makeDiagnostic } from "./make-diagnostics";

const NAMED_COLORS = new Set([
  "white", "black", "red", "green", "blue",
  "yellow", "cyan", "magenta", "transparent",
]);

function validateId(value: string): string | null {
  const strValue = value.trim();
  if (strValue === "")
    return "ID cannot be empty.";
  if (/\s/.test(strValue))
    return `ID cannot contain spaces: '${strValue}'.`;
  if (!/^[\w-]+$/.test(strValue))
    return `ID contains invalid characters. Use only letters, digits, hyphens, and underscores.`;
  return null;
}

function validateNumber(value: string): string | null {
  const strValue = value.trim();
  if (strValue === "")
    return "Expected a number but the value is empty.";
  for (const part of strValue.split(/\s+/)) {
    if (!/^-?\d+(\.\d+)?$/.test(part))
      return `Expected a number, got '${part}'. Remove any units or non-numeric characters.`;
  }
  return null;
}

function validateColor(value: string): string | null {
  const strValue = value.trim();

  if (strValue === "")
    return "Color value cannot be empty.";

  if (NAMED_COLORS.has(strValue))
    return null;

  if (strValue.startsWith("#")) {
    const hex = strValue.slice(1);
    if (!/^[0-9a-fA-F]+$/.test(hex))
      return `Hex color contains invalid characters: '${strValue}'. Only 0–9 and a–f are allowed.`;
    if (hex.length !== 3 && hex.length !== 6)
      return `Hex color must be 3 or 6 digits, got ${hex.length}: '${strValue}'.`;
    return null;
  }

  const rgbMatch = strValue.match(
    /^rgb\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)$/
  );
  if (rgbMatch) {
    const [r, g, b] = [rgbMatch[1], rgbMatch[2], rgbMatch[3]].map(Number);
    const outOfRange = (["r", "g", "b"] as const)
      .filter((_, i) => [r, g, b][i] < 0 || [r, g, b][i] > 255);
    if (outOfRange.length)
      return `rgb channel(s) out of 0–255 range: ${outOfRange.join(", ")}.`;
    return null;
  }

  const rgbaMatch = strValue.match(
    /^rgba\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)$/
  );
  if (rgbaMatch) {
    const [r, g, b, a] = [rgbaMatch[1], rgbaMatch[2], rgbaMatch[3], rgbaMatch[4]].map(Number);
    const outOfRange = (["r", "g", "b"] as const)
      .filter((_, i) => [r, g, b][i] < 0 || [r, g, b][i] > 255);
    if (outOfRange.length)
      return `rgba channel(s) out of 0–255 range: ${outOfRange.join(", ")}.`;
    if (a < 0 || a > 1)
      return `rgba alpha must be between 0.0 and 1.0, got ${a}.`;
    return null;
  }

  if (/^rgba?\s*\(/.test(strValue)) {
    const isRgba = strValue.startsWith("rgba");
    const inner = strValue.replace(/^rgba?\s*\(/, "").replace(/\).*$/, "");
    const parts = inner.split(",").map(s => s.trim()).filter(Boolean);
    const fn = isRgba ? "rgba" : "rgb";

    if (isRgba && parts.length === 3)
      return `rgba() requires 4 values (r, g, b, a) — the alpha channel is missing.`;
    if (!isRgba && parts.length === 4)
      return `rgb() only accepts 3 values (r, g, b) — use rgba() to include an alpha channel.`;
    if (parts.length !== (isRgba ? 4 : 3))
      return `${fn}() requires ${isRgba ? 4 : 3} values, got ${parts.length}.`;
    return `'${strValue}' is not a valid ${fn}() color — check that all values are numbers.`;
  }

  return (
    `Unknown color format: '${strValue}'. ` +
    `Expected a hex code (#rrggbb), rgb(r, g, b), rgba(r, g, b, a), or a preset name ` +
    `(${[...NAMED_COLORS].join(", ")}).`
  );
}

function validateString(value: string): string | null {
  if (value.trim() === "")
    return "Value cannot be empty.";
  return null;
}

export function validateValue(type: AttributeType, value: string): string | null {
  switch (type) {
    case AttributeType.ID: return validateId(value);
    case AttributeType.NUMBER: return validateNumber(value);
    case AttributeType.COLOR: return validateColor(value);
    case AttributeType.STRING: return validateString(value);
    case AttributeType.ENUM:
    default: return null
  }
}

export function validateTags(tags: TagToken[]): Diagnostic[] {
  const items: Diagnostic[] = [];

  for (const tag of tags) {
    if (!(schema.elements as readonly string[]).includes(tag.name)) {
      const suggestion = closestMatch(tag.name, schema.elements);
      const hint = suggestion ? ` Did you mean '<${suggestion}>'?` : "";
      items.push(makeDiagnostic(tag.line, tag.col, tag.name.length, DiagnosticSeverity.Error,
        `Unknown element '<${tag.name}>'.${hint}`));
      continue;
    }

    if (tag.type === "close") continue;

    const validAttrs = schema.attributes[tag.name] ?? [];

    for (const attr of tag.attrs) {
      if (!validAttrs.includes(attr.name)) {
        const suggestion = closestMatch(attr.name, validAttrs);
        const hint = suggestion ? ` Did you mean '${suggestion}'?` : "";
        items.push(makeDiagnostic(attr.line, attr.col, attr.name.length, DiagnosticSeverity.Error,
          `Unknown attribute '${attr.name}' on <${tag.name}>.${hint}`));
        continue;
      }

      if (attr.value === undefined) continue;
      const valueLength = attr.value.length;

      const validValues = schema.values[attr.name];
      if (validValues) {
        if (!validValues.includes(attr.value)) {
          const suggestion = closestMatch(attr.value, validValues);
          const hint = suggestion ? ` Did you mean '${suggestion}'?` : "";
          items.push(makeDiagnostic(attr.valueLine, attr.valueCol, Math.max(valueLength, 1), DiagnosticSeverity.Error,
            `Invalid value '${attr.value}' for '${attr.name}' on <${tag.name}>. Expected: ${validValues.join(", ")}.${hint}`));
        }
        continue;
      }
      const attrType = schema.attributeTypes[attr.name];
      if (attrType) {
        const error = validateValue(attrType, attr.value);
        if (error) {
          items.push(makeDiagnostic(attr.valueLine, attr.valueCol, Math.max(valueLength, 1), DiagnosticSeverity.Error, error));
        }
      }
    }
  }

  return items;
}
