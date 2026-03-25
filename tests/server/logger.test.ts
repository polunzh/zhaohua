import { describe, it, expect } from "vitest";

describe("Server Logger", () => {
  it("exports a logger instance with standard log methods", async () => {
    const { logger } = await import("../../server/utils/logger");
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.warn).toBe("function");
  });

  it("exports createLogger that returns tagged instance", async () => {
    const { createLogger } = await import("../../server/utils/logger");
    const tagged = createLogger("test-tag");
    expect(tagged).toBeDefined();
    expect(typeof tagged.info).toBe("function");
  });

  it("logger has level >= 4 (debug) in non-production", async () => {
    const { logger } = await import("../../server/utils/logger");
    expect(logger.level).toBeGreaterThanOrEqual(4);
  });
});
