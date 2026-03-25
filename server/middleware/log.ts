import { createLogger } from "../utils/logger";
import { formatRequest } from "../utils/format-request";

const log = createLogger("http");

export default eventHandler((event) => {
  event.context._startTime = Date.now();
  log.debug(`→ ${event.method} ${event.path}`);

  // Log after response using onAfterResponse hook
  event.node.res.on("finish", () => {
    const start = event.context._startTime as number | undefined;
    const elapsed = start ? Date.now() - start : 0;
    const status = event.node.res.statusCode;

    if (status >= 400) {
      log.warn(formatRequest(event.method, event.path, status, elapsed));
    } else {
      log.info(formatRequest(event.method, event.path, status, elapsed));
    }
  });
});
