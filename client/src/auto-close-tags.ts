import {
  ExtensionContext,
  Position,
  Range,
  SnippetString,
  TextDocumentChangeReason,
  window,
  workspace,
} from 'vscode';

const NAME = '[A-Za-z_][\\w.:-]*';
const ATTRS = `(?:\\s(?:[^<>"']|"[^"]*"|'[^']*')*?)?`;


const OPEN_TAG = new RegExp(`^<(${NAME})${ATTRS}>$`);
const TOKENS = new RegExp(`<!--[\\s\\S]*?-->|<\\/(${NAME})\\s*>|<(${NAME})${ATTRS}(\\/?)>`, 'g');

function insideComment(text: string): boolean {
  return text.lastIndexOf('<!--') > text.lastIndexOf('-->');
}

function innermostOpenTag(text: string): string | undefined {
  const stack: string[] = [];
  for (const m of text.matchAll(TOKENS)) {
    if (m[1]) {
      const i = stack.lastIndexOf(m[1]);
      if (i >= 0) stack.length = i;
    } else if (m[2] && !m[3]) {
      stack.push(m[2]);
    }
  }
  return stack.at(-1);
}

function closeAfterGt(before: string): string | undefined {
  if (before.endsWith('/>') || insideComment(before)) return;
  const m = OPEN_TAG.exec(before.slice(before.lastIndexOf('<')));
  return m ? `$0</${m[1]}>` : undefined;
}

function closeAfterSlash(before: string, after: string): string | undefined {
  if (!before.endsWith('</') || insideComment(before)) return;
  const tag = innermostOpenTag(before.slice(0, -2));
  if (!tag) return;
  return after.startsWith('>') ? tag : `${tag}>`;
}

export function registerAutoCloseTags(context: ExtensionContext): void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  context.subscriptions.push(workspace.onDidChangeTextDocument(e => {
    const doc = e.document;
    if (doc.languageId !== 'flml' || e.contentChanges.length !== 1) return;
    if (e.reason === TextDocumentChangeReason.Undo ||
      e.reason === TextDocumentChangeReason.Redo) return;
    if (!workspace.getConfiguration('flml', doc).get<boolean>('autoClosingTags', true)) return;

    const change = e.contentChanges[0];
    if (change.rangeLength !== 0 || (change.text !== '>' && change.text !== '/')) return;

    const editor = window.activeTextEditor;
    if (!editor || editor.document !== doc) return;

    const pos = change.range.start.translate(0, 1);
    const version = doc.version;

    clearTimeout(timer);
    timer = setTimeout(() => {
      if (doc.version !== version || !editor.selection.active.isEqual(pos)) return;

      const before = doc.getText(new Range(new Position(0, 0), pos));
      const after = doc.lineAt(pos.line).text.slice(pos.character);
      const snippet = change.text === '>'
        ? closeAfterGt(before)
        : closeAfterSlash(before, after);

      if (snippet) editor.insertSnippet(new SnippetString(snippet), pos);
    }, 50);
  }));
}