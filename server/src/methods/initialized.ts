import { RequestMessage } from "../types/types";

type ServerCapabilities = Record<string, unknown>

export interface InitializeResult {
  capabilities: ServerCapabilities;

  serverInfo?: {
    name: string;
    version?: string;
  }
}


export const initialize = (message: RequestMessage): InitializeResult=>{
  return {
    capabilities: {
      completionProvider: {},
      textDocumentSync: 1
    },
    serverInfo: {
      name: "flint-ui-lsp",
      version: "0.0.1"
    }
  }
};