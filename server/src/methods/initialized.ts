import { RequestMessage } from "../types/types";

interface ServerCapabilities {
  colorProvider?: boolean;
  completionProvider?: {
    triggerCharacters?: string[];
  };
  textDocumentSync?: number;
  diagnosticProvider?: {
    interFileDependencies: boolean;
    workspaceDiagnostics: boolean;
  };
  hoverProvider?: boolean;
}

export interface InitializeResult {
  capabilities: ServerCapabilities;

  serverInfo?: {
    name: string;
    version?: string;
  }
}


export const initialize = (_message: RequestMessage): InitializeResult => {
  return {
    capabilities: {
      colorProvider: true,
      completionProvider: {
        triggerCharacters: ["<", " ", "="]
      },
      textDocumentSync: 1,
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false
      },
      hoverProvider: true,
    },
    serverInfo: {
      name: "flintengine-language-server",
      version: "0.2.0"
    }
  }
};