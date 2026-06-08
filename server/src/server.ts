import log from "./log";
import { initialize } from "./methods/initialized";
import { completion } from "./methods/text-document/completion";
import { didChange } from "./methods/text-document/did-change";
import { didOpen } from "./methods/text-document/did-open";
import { NotificationMessage, RequestMessage, ResponseMessage } from "./types/types";

type RequestMethod = (message: RequestMessage) => ReturnType<typeof initialize> | ReturnType<typeof completion>;

type NotificationMethod = (message: NotificationMessage) => void;

const methodLookup: Record<string, RequestMethod | NotificationMethod> = {
  initialize,
  "textDocument/completion": completion,
  "textDocument/didChange": didChange,
  "textDocument/didOpen": didOpen
}

const response = (id: RequestMessage['id'], result: unknown) => {
  const resObj: ResponseMessage = {
    jsonrpc: "2.0",
    id,
    result: result ?? null
  };

  const message = JSON.stringify(resObj);
  const messageLength = Buffer.byteLength(message, 'utf-8');
  const header = `Content-Length: ${messageLength}\r\n\r\n`;

  log.write(header + message);
  process.stdout.write(header + message);
};

let buffer = "";

process.stdin.on("data", (chunk: Buffer | string) => {
  buffer += chunk.toString();

  while (true) {
    const lengthMatch = buffer.match(/Content-Length: (\d+)\r\n/);
    if (!lengthMatch) break;

    const contentLength = parseInt(lengthMatch[1], 10);
    const messageStart = buffer.indexOf("\r\n\r\n") + 4;

    if (buffer.length < messageStart + contentLength) break;

    const rawMessage = buffer.slice(messageStart, messageStart + contentLength);

    const message = JSON.parse(rawMessage) as RequestMessage;

    log.write({ id: message.id, method: message.method });

    const method = methodLookup[message.method];

    if (method) {
      const result = method(message);
      if (result !== undefined && message.id !== undefined) {
        response(message.id, result);
      }
    }

    buffer = buffer.slice(messageStart + contentLength);
  }
});