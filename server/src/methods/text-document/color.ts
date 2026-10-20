import { documents } from "../../document";
import { AttributeType, getAttributeConfig } from "../../lib/schema";
import { DocumentUri, Position, Range, RequestMessage } from "../../types/types";

interface Color {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

interface ColorInformation {
  range: Range;
  color: Color;
}

interface ColorPresentation {
  label: string;
}

interface DocumentColorParams {
  textDocument: { uri: DocumentUri };
}

interface ColorPresentationParams {
  textDocument: { uri: DocumentUri };
  color: Color;
  range: Range;
}

const NAMED_COLORS: Record<string, [number, number, number, number]> = {
  white: [255, 255, 255, 1],
  black: [0, 0, 0, 1],
  red: [255, 0, 0, 1],
  green: [0, 255, 0, 1],
  blue: [0, 0, 255, 1],
  yellow: [255, 255, 0, 1],
  cyan: [0, 255, 255, 1],
  magenta: [255, 0, 255, 1],
  transparent: [0, 0, 0, 0],
};

const NUM = String.raw`\s*(\d+(?:\.\d+)?)\s*`;
const RGB_RE = new RegExp(`^rgb\\(${NUM},${NUM},${NUM}\\)$`);
const RGBA_RE = new RegExp(`^rgba\\(${NUM},${NUM},${NUM},${NUM}\\)$`);

const ATTRIBUTE_RE = /([\w-]+)\s*=\s*(["'])(.*?)\2/g;

function fromBytes(r: number, g: number, b: number, a: number): Color | null {
  if ([r, g, b].some(c => c < 0 || c > 255) || a < 0 || a > 1) return null;
  return { red: r / 255, green: g / 255, blue: b / 255, alpha: a };
}

function parseColor(raw: string): Color | null {
  const value = raw.trim();

  const named = NAMED_COLORS[value];
  if (named) return fromBytes(...named);

  if (value.startsWith("#")) {
    let hex = value.slice(1);
    if (!/^[0-9a-fA-F]+$/.test(hex)) return null;
    if (hex.length === 3) hex = [...hex].map(c => c + c).join("");
    if (hex.length !== 6) return null;
    const n = parseInt(hex, 16);
    return fromBytes((n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff, 1);
  }

  const rgb = value.match(RGB_RE);
  if (rgb) return fromBytes(+rgb[1], +rgb[2], +rgb[3], 1);

  const rgba = value.match(RGBA_RE);
  if (rgba) return fromBytes(+rgba[1], +rgba[2], +rgba[3], +rgba[4]);

  return null;
}

function makePositionAt(text: string): (offset: number) => Position {
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") lineStarts.push(i + 1);
  }
  return (offset: number) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return { line: lo, character: offset - lineStarts[lo] };
  };
}

export const documentColor = (message: RequestMessage): ColorInformation[] => {
  const params = message.params as DocumentColorParams;
  const text = documents.get(params.textDocument.uri);
  if (!text) return [];

  const positionAt = makePositionAt(text);
  const result: ColorInformation[] = [];

  for (const match of text.matchAll(ATTRIBUTE_RE)) {
    const [whole, name, , value] = match;
    if (getAttributeConfig(name)?.type !== AttributeType.COLOR) continue;

    const color = parseColor(value);
    if (!color) {
      continue;
    }
    const end = match.index! + whole.length - 1;
    const start = end - value.length;
    result.push({ range: { start: positionAt(start), end: positionAt(end) }, color });
  }

  return result;
};

const to255 = (c: number) => Math.round(c * 255);
const hex2 = (c: number) => to255(c).toString(16).padStart(2, "0");
const trimAlpha = (a: number) => Number(a.toFixed(2)).toString();

export const colorPresentation = (message: RequestMessage): ColorPresentation[] => {
  const { color } = message.params as ColorPresentationParams;
  const r = to255(color.red);
  const g = to255(color.green);
  const b = to255(color.blue);

  const presentations: ColorPresentation[] = [
    { label: `rgba(${r}, ${g}, ${b}, ${trimAlpha(color.alpha)})` },
  ];
  if (color.alpha >= 1) {
    presentations.push({ label: `#${hex2(color.red)}${hex2(color.green)}${hex2(color.blue)}` });
    presentations.push({ label: `rgb(${r}, ${g}, ${b})` });
  }
  return presentations;
};