import * as path from "path";
import { workspace, ExtensionContext } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import { registerAutoCloseTags } from "./auto-close-tags";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const serverModule = context.asAbsolutePath(
    path.join("server", "out", "server.js")
  );

  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.stdio
    },
    debug: {
      module: serverModule,
      transport: TransportKind.stdio,
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: "file", language: "flml" }
    ],
    synchronize: {
      fileEvents: [workspace.createFileSystemWatcher("**/*.flml")],
    },
  };

  client = new LanguageClient(
    "flint-ui-lsp",
    "Flint UI Language Server",
    serverOptions,
    clientOptions
  );

  registerAutoCloseTags(context);

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}