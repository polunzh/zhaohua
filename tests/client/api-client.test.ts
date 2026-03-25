import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("API Client", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("fetchWorldState throws on non-ok response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    const { fetchWorldState } = await import("../../src/api/client");
    await expect(fetchWorldState()).rejects.toThrow("API error 500");
  });

  it("fetchWorldState returns data on success", async () => {
    const mockData = { gameDate: "1994-09-15" };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    });

    const { fetchWorldState } = await import("../../src/api/client");
    const result = await fetchWorldState();
    expect(result).toEqual(mockData);
  });

  it("submitChoice sends POST with correct body", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true }),
    });

    const { submitChoice } = await import("../../src/api/client");
    await submitChoice({
      npcId: "npc-1",
      choiceId: "encourage",
      gameDate: "1994-09-15",
      gameTime: "09:00",
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/choice",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("npc-1"),
      }),
    );
  });
});
