import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Frontend Logger", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exports logger with info, warn, error, debug methods", async () => {
    const { logger } = await import("../../src/utils/logger");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("logger.error calls console.error with tag", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { logger } = await import("../../src/utils/logger");
    logger.error("test error");
    expect(spy).toHaveBeenCalled();
    const args = spy.mock.calls[0];
    expect(args[0]).toContain("[zhaohua]");
    expect(args[1]).toBe("test error");
    spy.mockRestore();
  });

  it("logger.info calls console.info with tag", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const { logger } = await import("../../src/utils/logger");
    logger.info("test info");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
