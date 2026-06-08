import { documents } from "../../document";
import log from "../../log";
import { NotificationMessage, TextDocumentContentChangeEvent, VersionedTextDocumentIdentifier } from "../../types/types";



interface DidChangeTextDocumentParams {

  textDocument: VersionedTextDocumentIdentifier;


  contentChanges: TextDocumentContentChangeEvent[];
}


export const didChange = (message: NotificationMessage): void => {

  const params = message.params as DidChangeTextDocumentParams
  documents.set(params.textDocument.uri, params.contentChanges[0].text)

  log.write({ didChange: { uri: params.textDocument.uri, length: params.contentChanges[0].text.length } });

};