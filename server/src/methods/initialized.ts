import { RequestMessage } from "../types/types";

type ServerCapabilities = Record<string, unknown>

export interface InitializeResult {
  capabilities: ServerCapabilities;

  serverInfo?: {
    name: string;
    version?: string;
  }
}


export const initialize = (message: RequestMessage): InitializeResult => {
  return {
    capabilities: {
      completionProvider: {
        triggerCharacters: ["<", " ", "="]
      },
      textDocumentSync: 1,
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false
      }
    },
    serverInfo: {
      name: "flint-ui-lsp",
      version: "0.0.1"
    }
  }
};