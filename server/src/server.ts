#!/usr/bin/env node
import log from "./log";
import { initialize } from "./methods/initialized";
import { colorPresentation, documentColor } from "./methods/text-document/color";
import { completion } from "./methods/text-document/completion";
import { diagnostic } from "./methods/text-document/diagnostic";
import { didChange } from "./methods/text-document/did-change";
import { didOpen } from "./methods/text-document/did-open";
import { hover } from "./methods/text-document/hover";
import { NotificationMessage, RequestMessage, ResponseMessage } from "./types/types";

type RequestMethod = (message: RequestMessage) => ReturnType<typeof initialize> | ReturnType<typeof completion> | ReturnType<typeof diagnostic> | ReturnType<typeof hover> | ReturnType<typeof documentColor> | ReturnType<typeof colorPresentation>;

type NotificationMethod = (message: NotificationMessage) => void;

const methodLookup: Record<string, RequestMethod | NotificationMethod> = {
  initialize,
  initialized: () => undefined,
  "textDocument/colorPresentation": colorPresentation,
  "textDocument/completion": completion,
  "textDocument/documentColor": documentColor,
  "textDocument/didChange": didChange,
  "textDocument/didOpen": didOpen,
  "textDocument/diagnostic": diagnostic,
  "textDocument/hover": hover,
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

let buffer = Buffer.alloc(0);

process.stdin.on("data", (chunk: Buffer) => {
  buffer = Buffer.concat([buffer, chunk]);

  while (true) {
    const bufferString = buffer.toString("utf-8");
    const lengthMatch = bufferString.match(/Content-Length: (\d+)\r\n/);
    if (!lengthMatch) break;

    const contentLength = parseInt(lengthMatch[1], 10);
    const headerEnd = bufferString.indexOf("\r\n\r\n");
    if (headerEnd === -1) break;

    const messageStart = headerEnd + 4;

    if (buffer.length < messageStart + contentLength) break;

    const rawMessageBuffer = buffer.subarray(messageStart, messageStart + contentLength);
    const rawMessage = rawMessageBuffer.toString("utf-8");

    const message = JSON.parse(rawMessage) as RequestMessage;

    log.write({ id: message.id, method: message.method });

    const method = methodLookup[message.method];

    if (method) {
      const result = method(message);
      if (result !== undefined && message.id !== undefined) {
        response(message.id, result);
      }
    }

    buffer = buffer.subarray(messageStart + contentLength);
  }
});