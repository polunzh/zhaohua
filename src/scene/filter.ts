export function getNostalgiaFilterCSS(): string {
  return "sepia(15%) saturate(65%) brightness(1.05) contrast(0.88) hue-rotate(-3deg)";
}

export function getVignetteGradient(): string {
  return "radial-gradient(ellipse at center, transparent 50%, rgba(58, 46, 34, 0.25) 100%)";
}

export function applyColorGrading(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    r = r * 0.85 + 48;
    g = g * 0.85 + 42;
    b = b * 0.85 + 38;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const satMix = 0.6;
    r = lum + (r - lum) * satMix;
    g = lum + (g - lum) * satMix;
    b = lum + (b - lum) * satMix;
    if (lum > 160) {
      r = Math.min(255, r + 8);
      g = Math.min(255, g + 4);
      b = Math.max(0, b - 3);
    }
    if (lum < 80) {
      r = Math.max(0, r - 5);
      g = g + 2;
      b = b + 4;
    }
    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }
}
