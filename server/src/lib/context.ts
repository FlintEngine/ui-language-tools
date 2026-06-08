
export type CursorContext =
  | { kind: "element" }
  | { kind: "attribute"; element: string }
  | { kind: "value"; element: string; attribute: string }
  | { kind: "none" };

export function getCursorContext(line: string, character: number): CursorContext {
  const upToCursor = line.slice(0, character);

  // Inside a closing tag </... → no completions
  if (/.*<\/\w*$/.test(upToCursor)) {
    return { kind: "none" };
  }

  // After an attribute value assignment e.g. layout="
  const valueMatch = upToCursor.match(/<(\w+)[^>]*\s+(\w[\w-]*)="[^"]*$/);
  if (valueMatch) {
    return {
      kind: "value",
      element: valueMatch[1],
      attribute: valueMatch[2],
    };
  }
  const afterValueMatch = upToCursor.match(/<(\w+)(?:\s+[\w-]+="[^"]*")*\s*$/);
  if (afterValueMatch) {
    return {
      kind: "attribute",
      element: afterValueMatch[1],
    };
  }
  // Inside a tag after the element name e.g. <panel lay...
  const attributeMatch = upToCursor.match(/<(\w+)(\s+[\w-]*)?$/);
  if (attributeMatch && attributeMatch[2] !== undefined) {
    return {
      kind: "attribute",
      element: attributeMatch[1],
    };
  }

  // After < e.g. <pan...
  if (/.*<\w*$/.test(upToCursor)) {
    return { kind: "element" };
  }

  return { kind: "none" };
}