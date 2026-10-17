import { createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path"
const logFilePath = join(tmpdir(), "flint-lsp.log");

const log = createWriteStream(logFilePath)

export default {
  write: (message: object | unknown) => {
    if (typeof message === "object") {
      log.write(JSON.stringify(message));
    } else {
      log.write(message);
    }
    log.write("\n");
  }
}