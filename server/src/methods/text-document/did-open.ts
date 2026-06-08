import { documents } from "../../document";
import log from "../../log";
import { DocumentUri, NotificationMessage, TextDocumentContentChangeEvent, VersionedTextDocumentIdentifier } from "../../types/types";


interface DidOpenTextDocumentParams {
  textDocument: TextDocumentItem;
}

interface TextDocumentItem {

  uri: DocumentUri;

  languageId: string;

  version: number;

  text: string;
}

export const didOpen = (message: NotificationMessage): void => {
  const params = message.params as DidOpenTextDocumentParams;
  documents.set(params.textDocument.uri, params.textDocument.text);
  log.write({ didOpen: { uri: params.textDocument.uri, languageID: params.textDocument.languageId, length: params.textDocument.text.length } });
};