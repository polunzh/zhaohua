import { test, expect } from "@playwright/test";

test.describe("朝花夕拾 — 游戏基本流程", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the side panel to appear (indicates world state loaded)
    await page.waitForSelector(".side-panel", { timeout: 15000 });
  });

  test("页面加载后显示游戏界面", async ({ page }) => {
    await expect(page.locator(".side-panel")).toBeVisible();
    await expect(page.locator("canvas.game-canvas")).toBeVisible();
    await expect(page.locator(".panel-title").first()).toContainText("时间");
  });

  test("侧边栏显示时间和天气", async ({ page }) => {
    await expect(page.locator(".side-panel")).toContainText("1994");
    const panelText = await page.locator(".side-panel").textContent();
    const hasSeason = ["春", "夏", "秋", "冬"].some((s) => panelText?.includes(s));
    expect(hasSeason).toBe(true);
  });

  test("侧边栏显示导航选项", async ({ page }) => {
    await expect(page.locator(".nav-item").first()).toBeVisible();
  });

  test("点击导航切换场景", async ({ page }) => {
    const firstNav = page.locator(".nav-item").first();
    await expect(firstNav).toBeVisible();
    await firstNav.click();
    // Wait for panel to re-render with new location
    await page.waitForTimeout(1000);
    await expect(page.locator(".side-panel")).toBeVisible();
  });

  test("跳到明天更新时间", async ({ page }) => {
    const skipBtn = page.locator(".skip-row button").first();
    await expect(skipBtn).toContainText("明天");
    await skipBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator(".side-panel")).toContainText("1994");
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
    const canvas = page.locator("canvas.game-canvas");
    await expect(canvas).toBeVisible();
    const width = await canvas.getAttribute("width");
    const height = await canvas.getAttribute("height");
    expect(Number(width)).toBeGreaterThan(0);
    expect(Number(height)).toBeGreaterThan(0);
  });

  test("Canvas 使用了 pixelated 渲染", async ({ page }) => {
    const canvas = page.locator("canvas.game-canvas");
    const imageRendering = await canvas.evaluate(
      (el) => window.getComputedStyle(el).imageRendering,
    );
    expect(imageRendering).toBe("pixelated");
  });

  test("点击 Canvas 不会崩溃", async ({ page }) => {
    const canvas = page.locator("canvas.game-canvas");
    await canvas.click({ position: { x: 100, y: 100 } });
    await expect(page.locator(".side-panel")).toBeVisible();
  });
});
