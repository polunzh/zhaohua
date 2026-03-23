import type { ClickableArea, SceneDefinition } from "./scenes";
import { applyColorGrading } from "./filter";

export class SceneRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentScene: SceneDefinition | null = null;
  private onAreaClick: ((area: ClickableArea) => void) | null = null;
  private boundHandleClick: (e: MouseEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.boundHandleClick = this.handleClick.bind(this);
    this.canvas.addEventListener("click", this.boundHandleClick);
  }

  setClickHandler(handler: (area: ClickableArea) => void): void {
    this.onAreaClick = handler;
  }

  async renderScene(scene: SceneDefinition, backgroundUrl: string): Promise<void> {
    this.currentScene = scene;
    const ctx = this.ctx;

    ctx.fillStyle = "#F5E6C8";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    try {
      const img = await this.loadImage(backgroundUrl);
      ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      applyColorGrading(imageData.data);
      ctx.putImageData(imageData, 0, 0);
    } catch {
      this.drawPlaceholderScene(scene);
    }

    this.drawClickableAreas(scene.clickableAreas);
  }

  private drawPlaceholderScene(scene: SceneDefinition): void {
    const ctx = this.ctx;
    ctx.fillStyle = "#D4C08E";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#6B5B4E";
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.fillText(scene.name, this.canvas.width / 2, 30);
  }

  private drawClickableAreas(areas: ClickableArea[]): void {
    const ctx = this.ctx;
    for (const area of areas) {
      ctx.strokeStyle = "rgba(196, 112, 106, 0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(area.x, area.y, area.width, area.height);
      ctx.fillStyle = "#5C6B7A";
      ctx.font = "11px serif";
      ctx.textAlign = "center";
      ctx.fillText(area.label, area.x + area.width / 2, area.y + area.height + 14);
    }
    ctx.setLineDash([]);
  }

  private handleClick(e: MouseEvent): void {
    if (!this.currentScene || !this.onAreaClick) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (const area of this.currentScene.clickableAreas) {
      if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
        this.onAreaClick(area);
        return;
      }
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  destroy(): void {
    this.canvas.removeEventListener("click", this.boundHandleClick);
  }
}
