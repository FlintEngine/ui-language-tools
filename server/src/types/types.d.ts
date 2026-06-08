export interface Message {
  jsonrpc: string;
}


export interface NotificationMessage extends Message {
  method: string;
  params?: Array<unknown> | object;
}

export interface RequestMessage extends NotificationMessage {
  id: number | string;
}

export interface ResponseMessage extends Message {
  id: number | string | null;
  result?: unknown;
  error?: unknown;
}

export type DocumentBody = string;
export type DocumentUri = string;
export interface TextDocumentIdentifier {
  uri: DocumentUri;
}

export interface VersionedTextDocumentIdentifier extends TextDocumentIdentifier {
  version: number;
}

export type TextDocumentContentChangeEvent = {
  text: string;
};