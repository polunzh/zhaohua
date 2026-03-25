import { createLogger } from "../utils/logger";
import { formatRequest } from "../utils/format-request";

const log = createLogger("http");

export default defineEventHandler({
  onRequest(event) {
    event.context._startTime = Date.now();
    log.debug(`→ ${event.method} ${event.path}`);
  },
  onAfterResponse(event) {
    const start = event.context._startTime as number | undefined;
    const elapsed = start ? Date.now() - start : 0;
    const status = event.node?.res?.statusCode;

    if (status && status >= 400) {
      log.warn(formatRequest(event.method, event.path, status, elapsed));
    } else {
      log.info(formatRequest(event.method, event.path, status, elapsed));
    }
  },
});
