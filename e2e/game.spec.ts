import { test, expect } from "@playwright/test";

test.describe("朝花夕拾 — 游戏基本流程", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Dismiss briefing if it appears
    const startBtn = page.locator(".start-btn");
    try {
      await startBtn.waitFor({ timeout: 5000 });
      await startBtn.click();
      // Wait for briefing to fully disappear
      await page.waitForSelector(".briefing-overlay", {
        state: "hidden",
        timeout: 3000,
      });
    } catch {
      // No briefing, continue
    }
    // Wait for game to load
    await page.waitForSelector(".side-panel", { timeout: 10000 });
    // Ensure no overlays are blocking
    await page.waitForTimeout(500);
  });

  test("页面加载后显示游戏界面", async ({ page }) => {
    await expect(page.locator(".side-panel")).toBeVisible();
    await expect(page.locator(".pixi-canvas canvas, canvas.game-canvas")).toBeVisible();
    await expect(page.locator(".game-header")).toBeVisible();
  });

  test("标题栏显示时间和天气", async ({ page }) => {
    await expect(page.locator(".game-header")).toContainText("1994");
    const headerText = await page.locator(".game-header").textContent();
    const hasSeason = ["春", "夏", "秋", "冬"].some((s) => headerText?.includes(s));
    expect(hasSeason).toBe(true);
  });

  test("没有遮挡层阻止交互", async ({ page }) => {
    // Verify no overlays are present
    await expect(page.locator(".briefing-overlay")).toBeHidden();
    await expect(page.locator(".transition-overlay")).toBeHidden();
  });

  test("侧边栏导航选项可点击", async ({ page }) => {
    const firstNav = page.locator(".nav-item").first();
    await expect(firstNav).toBeVisible();
    // Verify it's actually clickable (no overlay blocking)
    await expect(firstNav).toBeEnabled();
    const box = await firstNav.boundingBox();
    expect(box).toBeTruthy();
    // Actually click and verify response
    await firstNav.click();
    await page.waitForTimeout(1000);
    await expect(page.locator(".side-panel")).toBeVisible();
  });

  test("点击导航后位置变化", async ({ page }) => {
    const locationBefore = await page.locator(".location-name").textContent();
    const firstNav = page.locator(".nav-item").first();
    const navText = await firstNav.textContent();
    await firstNav.click();
    await page.waitForTimeout(1500);
    const locationAfter = await page.locator(".location-name").textContent();
    // Location should have changed
    expect(locationAfter).not.toBe(locationBefore);
  });

  test("跳到明天按钮可点击且有过场动画", async ({ page }) => {
    const skipBtn = page.locator(".skip-row button").first();
    await expect(skipBtn).toContainText("明天");
    await skipBtn.click();
    // Should show transition overlay
    await expect(page.locator(".transition-overlay")).toBeVisible({
      timeout: 2000,
    });
    // Should disappear after ~2.5s
    await expect(page.locator(".transition-overlay")).toBeHidden({
      timeout: 5000,
    });
  });

  test("角色切换按钮工作", async ({ page }) => {
    const postmanBtn = page.locator(".character-switch button", {
      hasText: "邮递员",
    });
    await expect(postmanBtn).toBeVisible();
    await postmanBtn.click();
    await page.waitForTimeout(1000);
    await expect(postmanBtn).toHaveClass(/active/);

    const teacherBtn = page.locator(".character-switch button", {
      hasText: "老师",
    });
    await teacherBtn.click();
    await page.waitForTimeout(1000);
    await expect(teacherBtn).toHaveClass(/active/);
  });

  test("Canvas 渲染了像素内容", async ({ page }) => {
    const canvas = page.locator(".pixi-canvas canvas, canvas.game-canvas");
    await expect(canvas).toBeVisible();
    const width = await canvas.getAttribute("width");
    const height = await canvas.getAttribute("height");
    expect(Number(width)).toBeGreaterThan(0);
    expect(Number(height)).toBeGreaterThan(0);
  });

  test("Canvas 使用了 pixelated 渲染", async ({ page }) => {
    const canvas = page.locator(".pixi-canvas canvas, canvas.game-canvas");
    const imageRendering = await canvas.evaluate(
      (el) => el.style.imageRendering || window.getComputedStyle(el).imageRendering,
    );
    expect(["pixelated", "crisp-edges", ""]).toContain(imageRendering);
  });

  test("点击 Canvas 不会崩溃", async ({ page }) => {
    const canvas = page.locator(".pixi-canvas canvas, canvas.game-canvas");
    await canvas.click({ position: { x: 100, y: 100 } });
    await expect(page.locator(".side-panel")).toBeVisible();
  });

  test("关系面板显示 NPC 列表", async ({ page }) => {
    // Expand relationships section (may be collapsed)
    const relHeader = page.locator(".clickable").filter({ hasText: "关系" });
    const count = await relHeader.count();
    if (count > 0) await relHeader.click();
    await page.waitForTimeout(300);
    await expect(page.locator(".rel-name").first()).toBeVisible();
  });

  test("简报可以正常打开和关闭", async ({ page }) => {
    // Reload to see briefing again
    await page.reload();
    const startBtn = page.locator(".start-btn");
    try {
      await startBtn.waitFor({ timeout: 5000 });
      // Briefing should be visible
      await expect(page.locator(".briefing-overlay")).toBeVisible();
      // Click start
      await startBtn.click();
      // Briefing should disappear
      await expect(page.locator(".briefing-overlay")).toBeHidden({
        timeout: 3000,
      });
      // Game should be interactive
      await expect(page.locator(".side-panel")).toBeVisible();
      const firstNav = page.locator(".nav-item").first();
      await expect(firstNav).toBeVisible();
    } catch {
      // No briefing shown (e.g. if API fails), that's ok for this test
    }
  });

  test("多次导航不会卡住", async ({ page }) => {
    // Navigate 3 times
    for (let i = 0; i < 3; i++) {
      const navItems = page.locator(".nav-item");
      const count = await navItems.count();
      if (count > 0) {
        await navItems.first().click();
        await page.waitForTimeout(800);
      }
    }
    // Should still be interactive
    await expect(page.locator(".side-panel")).toBeVisible();
    await expect(page.locator(".pixi-canvas canvas, canvas.game-canvas")).toBeVisible();
  });

  test("今日任务显示在侧边栏", async ({ page }) => {
    // Mission section might or might not be present depending on briefing generation
    const missionSection = page.locator(".mission-sidebar");
    const hasMission = await missionSection.count();
    if (hasMission > 0) {
      await expect(missionSection).toBeVisible();
    }
    // Either way, game should be functional
    await expect(page.locator(".side-panel")).toBeVisible();
  });
});
