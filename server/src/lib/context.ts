export type CursorContext =
  | { kind: "element" }
  | { kind: "attribute"; element: string; }
  | { kind: "value"; element: string; attribute: string }
  | { kind: "none" };

export function getCursorContext(fullTextUpToCursor: string): CursorContext {
  const lastOpen = fullTextUpToCursor.lastIndexOf('<');
  const lastClose = fullTextUpToCursor.lastIndexOf('>');

  if (lastOpen > lastClose) {
    const tagContent = fullTextUpToCursor.slice(lastOpen);

    if (tagContent.startsWith("</")) {
      return { kind: "none" };
    }

    const elementMatch = tagContent.match(/^<([\w-]+)/);
    if (!elementMatch) {
      return { kind: "element" };
    }

    const element = elementMatch[1];

    const valueMatch = tagContent.match(/([\w-]+)="([^"]*)$/);
    if (valueMatch) {
      return {
        kind: "value",
        element,
        attribute: valueMatch[1],
      };
    }

    // If there is whitespace following the tag name, we are evaluating attributes
    if (/^<[\w-]+\s+/.test(tagContent)) {
      return { kind: "attribute", element };
    }

    // Otherwise, the user is still actively typing out the element token label itself
    return { kind: "element" };
  }

  // If we are OUTSIDE a tag block, check if a naked chevron sits right at the cursor edge
  if (/<\w*$/s.test(fullTextUpToCursor)) {
    return { kind: "element" };
  }

  return { kind: "none" };
}