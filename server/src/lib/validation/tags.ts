import { Diagnostic, DiagnosticSeverity } from "../../types/diagnostics-types";
import { AttrToken, TagToken } from "../../types/tags-types";
import { elements } from "../schema";

import { makeDiagnostic } from "./make-diagnostics";

function positionAt(content: string, offset: number): { line: number; col: number } {
  let line = 0, col = 0;
  for (let i = 0; i < offset && i < content.length; i++) {
    if (content[i] === "\n") { line++; col = 0; } else { col++; }
  }
  return { line, col };
}

export function scanTags(content: string): TagToken[] {
  const tags: TagToken[] = [];
  let i = 0;
  const len = content.length;

  while (i < len) {
    if (content[i] !== "<") { i++; continue; }
    i++;

    const isClose = content[i] === "/";
    if (isClose) i++;

    const nameStart = i;
    while (i < len && /[\w-]/.test(content[i])) i++;
    const name = content.slice(nameStart, i);
    if (!name) continue;

    const { line: nameLine, col: nameCol } = positionAt(content, nameStart);

    if (isClose) {
      while (i < len && content[i] !== ">") i++;
      if (content[i] === ">") i++;
      tags.push({ type: "close", name, line: nameLine, col: nameCol, attrs: [] });
      continue;
    }

    const attrs: AttrToken[] = [];

    while (i < len && !(content[i] === ">" || (content[i] === "/" && content[i + 1] === ">"))) {
      while (i < len && /\s/.test(content[i])) i++;
      if (content[i] === ">" || (content[i] === "/" && content[i + 1] === ">")) break;

      const attrNameStart = i;
      while (i < len && /[\w-]/.test(content[i])) i++;
      const attrName = content.slice(attrNameStart, i);
      if (!attrName) { i++; continue; }

      const { line: attrLine, col: attrCol } = positionAt(content, attrNameStart);

      if (content[i] !== "=") {
        attrs.push({ name: attrName, line: attrLine, col: attrCol, value: undefined, valueLine: attrLine, valueCol: attrCol });
        continue;
      }
      i++;

      if (content[i] !== '"') continue;
      i++;

      const valueStart = i;
      const { line: valLine, col: valCol } = positionAt(content, i);
      while (i < len && content[i] !== '"') i++;
      const value = content.slice(valueStart, i);
      if (content[i] === '"') i++;

      attrs.push({ name: attrName, line: attrLine, col: attrCol, value, valueLine: valLine, valueCol: valCol });
    }

    const isSelf = content[i] === "/";
    if (isSelf) i++;
    if (content[i] === ">") i++;

    tags.push({ type: isSelf ? "self" : "open", name, line: nameLine, col: nameCol, attrs });
  }

  return tags;
}


export function checkClosing(tags: TagToken[]): Diagnostic[] {
  const items: Diagnostic[] = [];
  const stack: TagToken[] = [];

  for (const tag of tags) {
    if (!(tag.name in elements)) continue;
    if (tag.type === "self") continue;

    if (tag.type === "open") {
      stack.push(tag);
      continue;
    }

    if (stack.length === 0) {
      items.push(makeDiagnostic(tag.line, tag.col, tag.name.length, DiagnosticSeverity.Error,
        `Unexpected closing tag '</${tag.name}>': no matching opening tag.`));
      continue;
    }

    const top = stack[stack.length - 1];
    if (top.name === tag.name) { stack.pop(); continue; }

    const ancestorIdx = stack.findLastIndex(e => e.name === tag.name);
    if (ancestorIdx !== -1) {
      const unclosed = stack.splice(ancestorIdx + 1);
      for (const e of unclosed) {
        items.push(makeDiagnostic(e.line, e.col, e.name.length, DiagnosticSeverity.Error,
          `'<${e.name}>' is never closed.`));
      }
      stack.pop();
    } else {
      items.push(makeDiagnostic(tag.line, tag.col, tag.name.length, DiagnosticSeverity.Error,
        `Unexpected closing tag '</${tag.name}>': expected '</${top.name}>' (opened on line ${top.line + 1}).`));
    }
  }

  for (const e of stack) {
    items.push(makeDiagnostic(e.line, e.col, e.name.length, DiagnosticSeverity.Error,
      `'<${e.name}>' is never closed.`));
  }

  return items;
}