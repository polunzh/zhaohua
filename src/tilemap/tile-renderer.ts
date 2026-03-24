import { getTileConfig, TILES } from "./tileset";
import type { SeasonalPalette } from "./season-palette";

// Dithering: checkerboard pattern between two colors for smooth gradients
export function ditherRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color1: string,
  color2: string,
): void {
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      ctx.fillStyle = (px + py) % 2 === 0 ? color1 : color2;
      ctx.fillRect(x + px, y + py, 1, 1);
    }
  }
}

// Hue-shifted shadow: shift toward cool blue for warm-toned objects
export function coolShadow(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - Math.floor(amount * 0.7));
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + Math.floor(amount * 0.3));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// Draw a varied grass background with 2-3 shades and blade detail
export function drawGrassBg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  grass: string[],
): void {
  // Base fill
  ctx.fillStyle = grass[1];
  ctx.fillRect(x, y, s, s);
  // Lighter patches
  ctx.fillStyle = grass[0];
  ctx.fillRect(x + 2, y + 4, 4, 3);
  ctx.fillRect(x + 18, y + 2, 5, 3);
  ctx.fillRect(x + 10, y + 22, 4, 3);
  ctx.fillRect(x + 26, y + 14, 3, 4);
  // Darker grass blades
  ctx.fillStyle = grass[2];
  ctx.fillRect(x + 0, y + 20, 1, 4);
  ctx.fillRect(x + 6, y + 26, 1, 3);
  ctx.fillRect(x + 14, y + 28, 1, 3);
  ctx.fillRect(x + 22, y + 24, 1, 4);
  ctx.fillRect(x + 28, y + 18, 1, 3);
  ctx.fillRect(x + 30, y + 26, 1, 3);
  ctx.fillRect(x + 8, y + 16, 1, 3);
  ctx.fillRect(x + 20, y + 10, 1, 3);
}

// Draw a single flower with petals arranged around a center
// cx, cy = center of flower head; stemBaseY = bottom of stem
export function drawSingleFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cx: number,
  cy: number,
  stemBaseY: number,
  petalColor: string,
  petalShadow: string,
  petalHighlight: string,
  centerColor: string,
  grass: string[],
  flowerState: string,
  dirt: string[],
): void {
  const stemX = cx - 1;
  const stemTop = cy + 3;
  // Stem: 2px wide, dark green
  ctx.fillStyle = grass[2];
  ctx.fillRect(x + stemX, y + stemTop, 2, stemBaseY - stemTop);

  if (flowerState === "bare") {
    // Dead nub on top of stem
    ctx.fillStyle = dirt[2];
    ctx.fillRect(x + stemX, y + stemTop - 2, 2, 2);
    ctx.fillRect(x + stemX - 1, y + stemTop - 1, 1, 1);
    return;
  }

  // Leaves on stem (1-2 small green ovals)
  ctx.fillStyle = grass[0];
  const leafY = stemTop + Math.floor((stemBaseY - stemTop) * 0.4);
  ctx.fillRect(x + stemX + 2, y + leafY, 3, 2);
  ctx.fillRect(x + stemX + 3, y + leafY - 1, 2, 1);
  if (stemBaseY - stemTop > 8) {
    const leafY2 = stemTop + Math.floor((stemBaseY - stemTop) * 0.7);
    ctx.fillRect(x + stemX - 3, y + leafY2, 3, 2);
    ctx.fillRect(x + stemX - 3, y + leafY2 - 1, 2, 1);
  }

  if (flowerState === "bud") {
    // Small closed bud — 2x2 pale circle
    const paleColor = petalHighlight;
    ctx.fillStyle = paleColor;
    ctx.fillRect(x + cx - 1, y + cy, 3, 3);
    ctx.fillStyle = petalColor;
    ctx.fillRect(x + cx, y + cy + 1, 1, 1);
    return;
  }

  if (flowerState === "wilt") {
    // Drooping/lopsided petals, muted brown-mixed color, shifted down
    const wy = cy + 1;
    ctx.fillStyle = petalShadow;
    // Petals droop right and down
    ctx.fillRect(x + cx - 3, y + wy, 3, 2); // left petal droops
    ctx.fillRect(x + cx + 1, y + wy + 1, 4, 2); // right petal droops lower
    ctx.fillRect(x + cx - 1, y + wy - 2, 3, 2); // top petal
    ctx.fillRect(x + cx, y + wy + 3, 2, 2); // bottom droops
    // Brown dead pixels mixed in
    ctx.fillStyle = dirt[2];
    ctx.fillRect(x + cx + 3, y + wy + 2, 1, 1);
    ctx.fillRect(x + cx - 2, y + wy + 1, 1, 1);
    // Faded center
    ctx.fillStyle = "#b0a050";
    ctx.fillRect(x + cx, y + wy, 1, 1);
    return;
  }

  // bloom: 5 petals arranged around center
  // Top petal (highlighted — light source top-left)
  ctx.fillStyle = petalHighlight;
  ctx.fillRect(x + cx - 1, y + cy - 4, 4, 3);
  ctx.fillRect(x + cx, y + cy - 5, 2, 1);

  // Left petal
  ctx.fillStyle = petalColor;
  ctx.fillRect(x + cx - 5, y + cy - 1, 3, 4);
  ctx.fillRect(x + cx - 4, y + cy, 2, 2);

  // Right petal
  ctx.fillStyle = petalColor;
  ctx.fillRect(x + cx + 3, y + cy - 1, 3, 4);
  ctx.fillRect(x + cx + 3, y + cy, 2, 2);

  // Bottom-left petal
  ctx.fillStyle = petalShadow;
  ctx.fillRect(x + cx - 3, y + cy + 3, 3, 3);
  ctx.fillRect(x + cx - 2, y + cy + 4, 2, 1);

  // Bottom-right petal
  ctx.fillStyle = petalShadow;
  ctx.fillRect(x + cx + 1, y + cy + 3, 3, 3);
  ctx.fillRect(x + cx + 2, y + cy + 4, 2, 1);

  // Center: 3x3 yellow dot
  ctx.fillStyle = centerColor;
  ctx.fillRect(x + cx - 1, y + cy - 1, 3, 3);
}

// Seeded pseudo-random for deterministic per-tile variation
function tileRand(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return (s >>> 0) / 0x7fffffff;
  };
}

// Draw a professional brick wall with per-brick highlights, shadows, inner texture,
// dithered mortar, and vertical light gradient.
export function drawBrickWall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  PAL: { brick: string[] },
): void {
  // 5 rows of bricks, each brick ~12×5px with 2px mortar between rows
  // Row layout: mortarY positions at 5, 12, 19, 26 (2px mortar each)
  // Brick rows: 0-4, 7-11, 14-18, 21-25, 28-31
  const rows = [
    { by: 0, bh: 5, offset: false },
    { by: 7, bh: 5, offset: true },
    { by: 14, bh: 5, offset: false },
    { by: 21, bh: 5, offset: true },
    { by: 28, bh: 4, offset: false },
  ];
  const mortarYs = [5, 12, 19, 26];
  const brickW = 12;
  const mortarW = 2;

  // Base fill
  ctx.fillStyle = PAL.brick[1];
  ctx.fillRect(x, y, s, s);

  // Vertical gradient: top bricks lighter, bottom darker
  // Overlay a subtle darkening on the bottom half
  ctx.fillStyle = PAL.brick[2];
  // Very subtle: dither the bottom 8px
  ditherRect(ctx, x, y + 24, s, 8, PAL.brick[1], PAL.brick[2]);

  // Draw dithered mortar lines (horizontal)
  for (const my of mortarYs) {
    ditherRect(ctx, x, y + my, s, 2, PAL.brick[0], PAL.brick[1]);
  }

  // Per-row bricks
  const rng = tileRand(x * 31 + y * 17);
  for (let ri = 0; ri < rows.length; ri++) {
    const row = rows[ri];
    const startX = row.offset ? -(brickW / 2) : 0;
    // Light falloff per row: top rows lighter
    const rowDarken = ri * 2; // 0,2,4,6,8

    for (let bx = startX; bx < s; bx += brickW + mortarW) {
      const left = Math.max(0, bx);
      const right = Math.min(s, bx + brickW);
      if (right <= left) continue;
      const w = right - left;

      // Vertical mortar (dithered) at brick joints
      if (bx >= 0 && bx < s && bx > 0) {
        ditherRect(ctx, x + bx - mortarW, y + row.by, mortarW, row.bh, PAL.brick[0], PAL.brick[1]);
      }

      // 1px top-left highlight (lighter than base)
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x + left, y + row.by, w, 1); // top edge
      ctx.fillRect(x + left, y + row.by, 1, row.bh); // left edge

      // 1px bottom-right shadow (darker, cool-shifted)
      ctx.fillStyle = coolShadow(PAL.brick[2], 5 + rowDarken);
      ctx.fillRect(x + left, y + row.by + row.bh - 1, w, 1); // bottom edge
      ctx.fillRect(x + right - 1, y + row.by, 1, row.bh); // right edge

      // Inner texture: 1-2 random darker pixels within the brick face
      const innerX1 = left + 2 + Math.floor(rng() * Math.max(1, w - 4));
      const innerY1 = row.by + 1 + Math.floor(rng() * Math.max(1, row.bh - 2));
      ctx.fillStyle = PAL.brick[2];
      ctx.fillRect(x + innerX1, y + innerY1, 1, 1);
      if (w > 6) {
        const innerX2 = left + 2 + Math.floor(rng() * Math.max(1, w - 4));
        const innerY2 = row.by + 1 + Math.floor(rng() * Math.max(1, row.bh - 2));
        ctx.fillRect(x + innerX2, y + innerY2, 1, 1);
      }
    }
  }

  // Bottom edge shadow line with cool shadow (2px)
  ctx.fillStyle = coolShadow(PAL.brick[3], 15);
  ctx.fillRect(x, y + 30, s, 2);
}

export function drawTile(
  ctx: CanvasRenderingContext2D,
  tileId: number,
  x: number,
  y: number,
  s: number,
  seasonPal: SeasonalPalette,
): void {
  const config = getTileConfig(tileId);
  if (!config || config.color === "transparent") return;

  // Convert SeasonalPalette material objects to array format [light, base, dark, shadow]
  const toArr = (m: { light: string; base: string; dark: string; shadow: string }) => [
    m.light,
    m.base,
    m.dark,
    m.shadow,
  ];
  const PAL = {
    grass: toArr(seasonPal.grass),
    dirt: toArr(seasonPal.dirt),
    brick: toArr(seasonPal.brick),
    wood: toArr(seasonPal.wood),
    floor: toArr(seasonPal.floor),
    stone: toArr(seasonPal.stone),
    metal: toArr(seasonPal.metal),
  };

  switch (tileId) {
    // -- Ground tiles --
    case TILES.DIRT: {
      // 3-shade base: random patches of light/dark over base fill
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Light patches (smooth highlights)
      ctx.fillStyle = PAL.dirt[0];
      ctx.fillRect(x + 2, y + 2, 4, 4);
      ctx.fillRect(x + 18, y + 6, 4, 4);
      ctx.fillRect(x + 8, y + 20, 4, 4);
      ctx.fillRect(x + 26, y + 14, 4, 4);
      ctx.fillRect(x + 14, y + 12, 4, 4);
      // Dark patches (shadow/pebble areas)
      ctx.fillStyle = PAL.dirt[2];
      ctx.fillRect(x + 10, y + 2, 4, 4);
      ctx.fillRect(x + 24, y + 0, 4, 4);
      ctx.fillRect(x + 0, y + 14, 4, 4);
      ctx.fillRect(x + 20, y + 20, 4, 4);
      ctx.fillRect(x + 28, y + 8, 4, 4);
      // Pebble cluster 1: 3 pixels near top-left
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 5, y + 8, 2, 1);
      ctx.fillRect(x + 6, y + 9, 1, 1);
      ctx.fillStyle = PAL.dirt[0];
      ctx.fillRect(x + 5, y + 7, 1, 1); // highlight on pebble
      // Pebble cluster 2: near center-right
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 22, y + 12, 2, 2);
      ctx.fillRect(x + 24, y + 13, 1, 1);
      ctx.fillStyle = PAL.dirt[0];
      ctx.fillRect(x + 22, y + 11, 1, 1);
      // Pebble cluster 3: lower-left
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 4, y + 24, 2, 1);
      ctx.fillRect(x + 3, y + 25, 1, 1);
      ctx.fillRect(x + 5, y + 25, 1, 1);
      // Pebble cluster 4: lower-right
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 26, y + 22, 1, 2);
      ctx.fillRect(x + 27, y + 23, 2, 1);
      // Tire track / path marks: thin horizontal lines at 1/3 and 2/3
      ctx.fillStyle = PAL.dirt[2];
      ctx.fillRect(x + 1, y + 10, 30, 1); // upper track line 1
      ctx.fillRect(x + 3, y + 11, 26, 1); // upper track line 2 (narrower)
      ctx.fillRect(x + 1, y + 21, 30, 1); // lower track line 1
      ctx.fillRect(x + 3, y + 22, 26, 1); // lower track line 2
      // Subtle highlight inside tracks (worn smooth spots)
      ctx.fillStyle = PAL.dirt[0];
      ctx.fillRect(x + 8, y + 10, 3, 1);
      ctx.fillRect(x + 16, y + 11, 4, 1);
      ctx.fillRect(x + 20, y + 21, 3, 1);
      ctx.fillRect(x + 9, y + 22, 4, 1);
      // Bottom 2px: ambient occlusion dithered edge
      ditherRect(ctx, x, y + s - 4, s, 4, PAL.dirt[1], PAL.dirt[3]);
      break;
    }

    case TILES.GRASS: {
      // 3-shade base: base fill + lighter and darker 4x4 patches
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Lighter green patches (scattered 4x4)
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 2, y + 4, 4, 4);
      ctx.fillRect(x + 20, y + 0, 4, 4);
      ctx.fillRect(x + 12, y + 16, 4, 4);
      ctx.fillRect(x + 28, y + 10, 4, 4);
      ctx.fillRect(x + 6, y + 24, 4, 4);
      // Darker green patches (scattered 4x4)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 10, y + 2, 4, 4);
      ctx.fillRect(x + 0, y + 14, 4, 4);
      ctx.fillRect(x + 24, y + 20, 4, 4);
      ctx.fillRect(x + 16, y + 8, 4, 4);
      // Grass blades -- varying height (2-5px), some 2px wide, some lean
      ctx.fillStyle = PAL.grass[2];
      // Tall blades (5px)
      ctx.fillRect(x + 3, y + 3, 1, 5);
      ctx.fillRect(x + 19, y + 1, 1, 5);
      ctx.fillRect(x + 11, y + 13, 1, 5);
      ctx.fillRect(x + 27, y + 17, 1, 5);
      // Medium blades (3-4px)
      ctx.fillRect(x + 8, y + 7, 1, 4);
      ctx.fillRect(x + 24, y + 5, 1, 3);
      ctx.fillRect(x + 14, y + 21, 1, 4);
      ctx.fillRect(x + 30, y + 11, 1, 3);
      ctx.fillRect(x + 6, y + 19, 1, 4);
      ctx.fillRect(x + 22, y + 15, 1, 3);
      // Short blades (2px)
      ctx.fillRect(x + 1, y + 10, 1, 2);
      ctx.fillRect(x + 17, y + 26, 1, 2);
      ctx.fillRect(x + 29, y + 24, 1, 2);
      // Wide blades (2px wide)
      ctx.fillRect(x + 15, y + 5, 2, 4);
      ctx.fillRect(x + 5, y + 27, 2, 3);
      // Leaning blades (1px offset at top)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 9, y + 23, 1, 3); // base
      ctx.fillRect(x + 10, y + 22, 1, 1); // lean right
      ctx.fillRect(x + 21, y + 9, 1, 3); // base
      ctx.fillRect(x + 20, y + 8, 1, 1); // lean left
      ctx.fillRect(x + 26, y + 27, 1, 3); // base
      ctx.fillRect(x + 27, y + 26, 1, 1); // lean right
      ctx.fillRect(x + 3, y + 16, 1, 3); // base
      ctx.fillRect(x + 2, y + 15, 1, 1); // lean left
      // Highlight blade tips
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 3, y + 3, 1, 1);
      ctx.fillRect(x + 19, y + 1, 1, 1);
      ctx.fillRect(x + 11, y + 13, 1, 1);
      ctx.fillRect(x + 15, y + 5, 1, 1);
      // Tiny wildflower dots (1x1px)
      ctx.fillStyle = "#e8e060"; // yellow
      ctx.fillRect(x + 13, y + 10, 1, 1);
      ctx.fillStyle = "#f0f0e0"; // white
      ctx.fillRect(x + 25, y + 3, 1, 1);
      // Bottom 2px: darker dithered edge (ambient occlusion)
      ditherRect(ctx, x, y + s - 2, s, 2, PAL.grass[1], PAL.grass[3]);
      break;
    }

    case TILES.FLOOR_CLASSROOM: {
      // Base fill -- warm paper tone
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // Sub-tile brightness variation: top-left lightest
      ctx.fillStyle = PAL.floor[0];
      ctx.globalAlpha = 0.12;
      ctx.fillRect(x + 1, y + 1, 15, 15); // top-left lightest
      ctx.globalAlpha = 0.04;
      ctx.fillRect(x + 17, y + 1, 14, 15); // top-right slightly lighter
      ctx.globalAlpha = 0.06;
      ctx.fillRect(x + 17, y + 17, 14, 14); // bottom-right slightly darker via no highlight
      ctx.globalAlpha = 1.0;
      // Bottom-left sub-tile: very slightly darker
      ctx.fillStyle = PAL.floor[2];
      ctx.globalAlpha = 0.08;
      ctx.fillRect(x + 1, y + 17, 15, 14);
      ctx.globalAlpha = 1.0;
      // Wood grain lines per sub-tile (2-3 thin horizontal lines each)
      ctx.fillStyle = PAL.floor[2];
      // Top-left sub-tile grain
      ctx.fillRect(x + 2, y + 4, 10, 1);
      ctx.fillRect(x + 3, y + 8, 8, 1);
      ctx.fillRect(x + 2, y + 12, 11, 1);
      // Top-right sub-tile grain
      ctx.fillRect(x + 19, y + 5, 9, 1);
      ctx.fillRect(x + 18, y + 9, 10, 1);
      ctx.fillRect(x + 20, y + 13, 8, 1);
      // Bottom-left sub-tile grain
      ctx.fillRect(x + 3, y + 20, 9, 1);
      ctx.fillRect(x + 2, y + 24, 10, 1);
      ctx.fillRect(x + 4, y + 28, 7, 1);
      // Bottom-right sub-tile grain
      ctx.fillRect(x + 19, y + 21, 8, 1);
      ctx.fillRect(x + 18, y + 25, 10, 1);
      ctx.fillRect(x + 20, y + 29, 7, 1);
      // Grain highlight lines (subtle lighter streaks)
      ctx.fillStyle = PAL.floor[0];
      ctx.fillRect(x + 5, y + 6, 6, 1);
      ctx.fillRect(x + 21, y + 7, 5, 1);
      ctx.fillRect(x + 4, y + 22, 7, 1);
      ctx.fillRect(x + 22, y + 23, 5, 1);
      // Joint lines: center cross where 4 sub-tiles meet
      ctx.fillStyle = PAL.floor[2];
      ctx.fillRect(x + 15, y, 2, s); // center vertical joint (2px wide)
      ctx.fillRect(x, y + 15, s, 2); // center horizontal joint (2px wide)
      // Joint shadow (darker inner edge)
      ctx.fillStyle = PAL.floor[3];
      ctx.fillRect(x + 16, y, 1, s); // right side of vertical joint
      ctx.fillRect(x, y + 16, s, 1); // bottom side of horizontal joint
      // Edge joints (tile border)
      ctx.fillStyle = PAL.floor[2];
      ctx.fillRect(x, y, 1, s); // left edge
      ctx.fillRect(x, y, s, 1); // top edge
      ctx.fillRect(x + 31, y, 1, s); // right edge
      ctx.fillRect(x, y + 31, s, 1); // bottom edge
      // Shadow at joint intersection (center point)
      ctx.fillStyle = PAL.floor[3];
      ctx.fillRect(x + 15, y + 15, 2, 2);
      // Corner shadows
      ctx.fillRect(x, y + 31, 1, 1);
      ctx.fillRect(x + 31, y + 31, 1, 1);
      break;
    }

    case TILES.FLOOR_OFFICE: {
      // Base fill
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // 3px border grid
      ctx.fillStyle = PAL.floor[2];
      ctx.fillRect(x, y, 3, s); // left border
      ctx.fillRect(x, y, s, 3); // top border
      ctx.fillRect(x + 29, y, 3, s); // right border
      ctx.fillRect(x, y + 29, s, 3); // bottom border
      // Inner highlight
      ctx.fillStyle = PAL.floor[0];
      ctx.fillRect(x + 6, y + 6, 2, 2);
      ctx.fillRect(x + 16, y + 10, 2, 2);
      ctx.fillRect(x + 10, y + 20, 2, 1);
      ctx.fillRect(x + 22, y + 14, 2, 1);
      // Subtle wood grain inside
      ctx.fillStyle = PAL.floor[2];
      ctx.fillRect(x + 8, y + 14, 6, 1);
      ctx.fillRect(x + 18, y + 20, 4, 1);
      ctx.fillRect(x + 12, y + 8, 3, 1);
      ctx.fillRect(x + 6, y + 24, 5, 1);
      // Dark corner accents (3x3)
      ctx.fillStyle = PAL.floor[3];
      ctx.fillRect(x, y, 3, 3);
      ctx.fillRect(x + 29, y, 3, 3);
      ctx.fillRect(x, y + 29, 3, 3);
      ctx.fillRect(x + 29, y + 29, 3, 3);
      break;
    }

    case TILES.ROAD: {
      // Base fill
      ctx.fillStyle = PAL.dirt[2];
      ctx.fillRect(x, y, s, s);
      // Edge darkening (3px each side)
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x, y, 3, s); // left edge
      ctx.fillRect(x + 29, y, 3, s); // right edge
      // Center dashed line (2px wide)
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x + 15, y + 2, 2, 8);
      ctx.fillRect(x + 15, y + 18, 2, 8);
      // Pebble clusters (5 clusters)
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 8, y + 6, 2, 1);
      ctx.fillRect(x + 9, y + 7, 1, 1);
      ctx.fillRect(x + 20, y + 16, 2, 1);
      ctx.fillRect(x + 21, y + 17, 1, 1);
      ctx.fillRect(x + 10, y + 26, 2, 2);
      ctx.fillRect(x + 24, y + 8, 1, 1);
      ctx.fillRect(x + 6, y + 20, 2, 1);
      // Highlight spots
      ctx.fillStyle = PAL.dirt[0];
      ctx.fillRect(x + 6, y + 14, 2, 1);
      ctx.fillRect(x + 24, y + 10, 2, 1);
      ctx.fillRect(x + 12, y + 22, 1, 1);
      break;
    }

    // -- Wall tiles --
    case TILES.WALL_BRICK: {
      drawBrickWall(ctx, x, y, s, PAL);
      break;
    }

    case TILES.WALL_TOP: {
      // Bottom 20px: brick section
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y + 12, s, 20);
      // Brick mortar lines
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x, y + 20, s, 2);
      ctx.fillRect(x + 14, y + 12, 2, 8);
      ctx.fillRect(x + 6, y + 22, 2, 10);
      ctx.fillRect(x + 22, y + 22, 2, 10);
      // Brick highlight
      ctx.fillRect(x + 2, y + 14, 4, 1);
      ctx.fillRect(x + 18, y + 14, 4, 1);
      ctx.fillRect(x + 8, y + 22, 4, 1);
      // Brick shadow
      ctx.fillStyle = PAL.brick[2];
      ctx.fillRect(x + 10, y + 18, 3, 2);
      ctx.fillRect(x + 26, y + 18, 3, 2);
      ctx.fillRect(x + 18, y + 28, 3, 2);
      // Top 12px: roof edge
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(x, y, s, 12);
      // Highlight line at very top
      ctx.fillStyle = "#a06828";
      ctx.fillRect(x, y, s, 2);
      ctx.fillRect(x + 2, y + 2, 6, 2);
      ctx.fillRect(x + 16, y + 2, 6, 2);
      // Dark line at bottom of roof section
      ctx.fillStyle = "#6a3010";
      ctx.fillRect(x, y + 10, s, 2);
      // Shingle texture on roof portion
      ctx.fillStyle = "#a06828";
      ctx.fillRect(x + 6, y + 4, 4, 2);
      ctx.fillRect(x + 20, y + 6, 4, 2);
      ctx.fillRect(x + 12, y + 5, 3, 1);
      ctx.fillRect(x + 26, y + 4, 3, 1);
      break;
    }

    case TILES.ROOF: {
      // Base fill
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(x, y, s, s);
      // Shingle pattern -- overlapping rows (6px tall each)
      // Row 1 (y 0-5)
      ctx.fillStyle = "#a06828";
      ctx.fillRect(x + 2, y, 10, 2);
      ctx.fillRect(x + 18, y, 10, 2);
      ctx.fillRect(x + 0, y + 2, 6, 2);
      ctx.fillRect(x + 16, y + 2, 6, 2);
      // Row 2 (y 8-13)
      ctx.fillRect(x + 8, y + 8, 10, 2);
      ctx.fillRect(x + 24, y + 8, 6, 2);
      ctx.fillRect(x + 6, y + 10, 6, 2);
      ctx.fillRect(x + 22, y + 10, 6, 2);
      // Row 3 (y 16-21)
      ctx.fillRect(x + 2, y + 16, 10, 2);
      ctx.fillRect(x + 18, y + 16, 10, 2);
      ctx.fillRect(x + 0, y + 18, 6, 2);
      ctx.fillRect(x + 16, y + 18, 6, 2);
      // Row 4 (y 24-29)
      ctx.fillRect(x + 8, y + 24, 10, 2);
      ctx.fillRect(x + 24, y + 24, 6, 2);
      ctx.fillRect(x + 6, y + 26, 6, 2);
      ctx.fillRect(x + 22, y + 26, 6, 2);
      // Dithered shadow lines between shingle rows for natural wood look
      ditherRect(ctx, x, y + 6, s, 2, "#8B4513", "#6a3010");
      ditherRect(ctx, x, y + 14, s, 2, "#8B4513", "#6a3010");
      ditherRect(ctx, x, y + 22, s, 2, "#8B4513", "#6a3010");
      ditherRect(ctx, x, y + 30, s, 2, "#8B4513", "#6a3010");
      // Extra deep shadow spots with cool shadow
      ctx.fillStyle = coolShadow("#6a3010", 10);
      ctx.fillRect(x + 12, y + 6, 4, 2);
      ctx.fillRect(x + 4, y + 14, 4, 2);
      ctx.fillRect(x + 28, y + 22, 4, 2);
      // Snow on roof (winter)
      if (seasonPal.showSnow) {
        ctx.fillStyle = "#e8e8e8";
        ctx.fillRect(x + 2, y, 28, 2);
        ctx.fillRect(x + 0, y + 2, 32, 2);
        ctx.fillRect(x + 4, y + 4, 24, 2);
        ctx.fillStyle = "#d0d0d0";
        ctx.fillRect(x + 8, y + 4, 6, 2);
        ctx.fillRect(x + 20, y + 4, 6, 2);
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(x + 6, y + 1, 4, 1);
        ctx.fillRect(x + 22, y + 1, 4, 1);
      }
      break;
    }

    // -- Object tiles --
    case TILES.DESK: {
      // Floor underneath
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // Desk top surface (24x8)
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 4, y + 8, 24, 8);
      // Top edge highlight (2px)
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 4, y + 8, 24, 2);
      ctx.fillRect(x + 6, y + 10, 4, 1);
      // Wood grain on desk top
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 10, y + 12, 6, 1);
      ctx.fillRect(x + 20, y + 10, 4, 1);
      ctx.fillRect(x + 8, y + 14, 3, 1);
      ctx.fillRect(x + 18, y + 13, 5, 1);
      // Bottom edge shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 4, y + 15, 24, 1);
      // Drawer outline on front face
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 10, y + 16, 12, 4);
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 10, y + 16, 12, 1);
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 10, y + 19, 12, 1);
      // Drawer handle
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 14, y + 17, 4, 1);
      // Two legs (4x10 each)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 6, y + 16, 4, 10);
      ctx.fillRect(x + 22, y + 16, 4, 10);
      // Leg highlights
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 6, y + 16, 2, 10);
      ctx.fillRect(x + 22, y + 16, 2, 10);
      // Leg shadows with cool hue shift
      ctx.fillStyle = coolShadow(PAL.wood[3], 12);
      ctx.fillRect(x + 9, y + 24, 1, 2);
      ctx.fillRect(x + 25, y + 24, 1, 2);
      // Shadow on floor beneath desk with cool shift
      ctx.fillStyle = coolShadow(PAL.floor[3], 10);
      ctx.fillRect(x + 8, y + 26, 16, 2);
      // Top-left light edge on desk top
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 4, y + 8, 24, 1); // top edge highlight
      ctx.fillRect(x + 4, y + 8, 1, 18); // left edge highlight
      // Bottom-right shadow edge on desk
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 4, y + 25, 24, 1); // bottom edge shadow
      ctx.fillRect(x + 27, y + 8, 1, 18); // right edge shadow
      break;
    }

    case TILES.BLACKBOARD: {
      // Wall background
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y, s, s);
      // Wooden frame (outer) -- 24x18 board with 2px frame
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 3, y + 2, 26, 22);
      // Frame highlight top-left (2px)
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 3, y + 2, 26, 2);
      ctx.fillRect(x + 3, y + 2, 2, 22);
      // Frame shadow bottom-right (2px)
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 3, y + 22, 26, 2);
      ctx.fillRect(x + 27, y + 2, 2, 22);
      // Board surface (dark green-black)
      ctx.fillStyle = "#2a3a2e";
      ctx.fillRect(x + 5, y + 4, 22, 16);
      // Slightly lighter board center
      ctx.fillStyle = "#344438";
      ctx.fillRect(x + 7, y + 6, 18, 12);
      // Chalk marks (5 lines of varying lengths)
      ctx.fillStyle = "#d0d0c8";
      ctx.fillRect(x + 8, y + 8, 8, 1);
      ctx.fillRect(x + 18, y + 8, 4, 1);
      ctx.fillStyle = "#c0c0b8";
      ctx.fillRect(x + 7, y + 12, 10, 1);
      ctx.fillRect(x + 10, y + 16, 6, 1);
      ctx.fillStyle = "#d8d8d0";
      ctx.fillRect(x + 20, y + 11, 3, 1);
      // Chalk tray (2px tall)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 6, y + 20, 20, 2);
      // Chalk tray highlight
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 6, y + 20, 20, 1);
      // Chalk pieces on tray (3 pieces)
      ctx.fillStyle = "#e8e8e0";
      ctx.fillRect(x + 10, y + 20, 3, 2);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 16, y + 20, 2, 2);
      ctx.fillStyle = "#c85050";
      ctx.fillRect(x + 20, y + 20, 2, 2);
      // Wall mortar hint at edges
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x, y + 14, 2, 1);
      ctx.fillRect(x + 30, y + 8, 2, 1);
      ctx.fillRect(x + 1, y + 26, 1, 1);
      break;
    }

    case TILES.WINDOW: {
      // Wall background
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y, s, s);
      // Brick mortar hints
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x, y + 8, 3, 1);
      ctx.fillRect(x + 29, y + 24, 3, 1);
      ctx.fillRect(x + 1, y + 28, 2, 1);
      // Window sill at bottom: 2px high, extends 2px wider than frame
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 2, y + 28, 28, 2);
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 2, y + 28, 28, 1); // sill top highlight
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 2, y + 30, 28, 1); // sill bottom shadow
      // Window frame (wood) -- 24x24
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 4, y + 3, 24, 25);
      // Frame highlight (2px)
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 4, y + 3, 24, 2);
      ctx.fillRect(x + 4, y + 3, 2, 25);
      // Frame shadow (2px)
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 4, y + 26, 24, 2);
      ctx.fillRect(x + 26, y + 3, 2, 25);
      // Wood grain on outer frame: thin horizontal lines
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 5, y + 7, 1, 1); // left frame grain
      ctx.fillRect(x + 5, y + 14, 1, 1);
      ctx.fillRect(x + 5, y + 21, 1, 1);
      ctx.fillRect(x + 27, y + 9, 1, 1); // right frame grain
      ctx.fillRect(x + 27, y + 18, 1, 1);
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 8, y + 3, 4, 1); // top frame grain
      ctx.fillRect(x + 18, y + 4, 5, 1);
      ctx.fillRect(x + 10, y + 27, 4, 1); // bottom frame grain
      ctx.fillRect(x + 20, y + 26, 3, 1);
      // Glass -- gradient: top lighter (sky), bottom darker
      ctx.fillStyle = "#b0d8f0";
      ctx.fillRect(x + 6, y + 5, 20, 5);
      ctx.fillStyle = "#a0cce8";
      ctx.fillRect(x + 6, y + 10, 20, 5);
      ctx.fillStyle = "#90c0d8";
      ctx.fillRect(x + 6, y + 15, 20, 5);
      ctx.fillStyle = "#80b4cc";
      ctx.fillRect(x + 6, y + 20, 20, 6);
      // Cross frame (2px dividers)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 15, y + 5, 2, 21); // vertical
      ctx.fillRect(x + 6, y + 14, 20, 2); // horizontal
      // Wood grain on cross frame
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 15, y + 8, 1, 1);
      ctx.fillRect(x + 16, y + 18, 1, 1);
      ctx.fillRect(x + 9, y + 14, 1, 1);
      ctx.fillRect(x + 21, y + 15, 1, 1);
      // Clear white reflection in top-left pane (4x3px)
      ctx.fillStyle = "#e0f4ff";
      ctx.fillRect(x + 8, y + 7, 4, 2);
      ctx.fillRect(x + 8, y + 9, 2, 1);
      // Secondary subtle reflection bottom-right
      ctx.fillStyle = "#b8d8e8";
      ctx.fillRect(x + 22, y + 22, 2, 2);
      // Curtain hints: 2px wide faded warm strips at inner edges
      ctx.fillStyle = "#c4706a";
      ctx.globalAlpha = 0.3;
      ctx.fillRect(x + 6, y + 5, 2, 21); // left curtain
      ctx.fillRect(x + 24, y + 5, 2, 21); // right curtain
      ctx.globalAlpha = 0.2;
      ctx.fillRect(x + 8, y + 6, 1, 6); // left curtain fold
      ctx.fillRect(x + 23, y + 6, 1, 6); // right curtain fold
      ctx.globalAlpha = 1.0;
      break;
    }

    case TILES.DOOR: {
      // Wall background
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y, s, s);
      // Door frame (darker wood) -- visibly different from door surface
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 5, y + 2, 22, 29);
      // Frame left edge highlight
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 5, y + 2, 1, 29);
      ctx.fillRect(x + 5, y + 2, 22, 1); // top edge highlight
      // Frame right shadow (2px cool-shifted)
      ctx.fillStyle = coolShadow(PAL.wood[3], 10);
      ctx.fillRect(x + 25, y + 3, 2, 28);
      // Door surface (lighter than frame)
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 7, y + 4, 18, 24);
      // Subtle wood grain on door surface
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 9, y + 8, 8, 1);
      ctx.fillRect(x + 11, y + 15, 6, 1);
      ctx.fillRect(x + 8, y + 22, 7, 1);
      ctx.fillRect(x + 16, y + 12, 5, 1);
      ctx.fillRect(x + 14, y + 20, 6, 1);
      // Top panel with recessed effect
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 9, y + 6, 14, 8);
      // Top panel border (1px darker all around)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 9, y + 6, 14, 1); // top
      ctx.fillRect(x + 9, y + 13, 14, 1); // bottom
      ctx.fillRect(x + 9, y + 6, 1, 8); // left
      ctx.fillRect(x + 22, y + 6, 1, 8); // right
      // Top panel inner highlight (1px)
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 10, y + 7, 12, 1);
      ctx.fillRect(x + 10, y + 7, 1, 5);
      // Top panel inner shadow (1px)
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 10, y + 12, 12, 1);
      ctx.fillRect(x + 21, y + 7, 1, 5);
      // Bottom panel with recessed effect
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 9, y + 17, 14, 9);
      // Bottom panel border (1px darker all around)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 9, y + 17, 14, 1);
      ctx.fillRect(x + 9, y + 25, 14, 1);
      ctx.fillRect(x + 9, y + 17, 1, 9);
      ctx.fillRect(x + 22, y + 17, 1, 9);
      // Bottom panel inner highlight
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 10, y + 18, 12, 1);
      ctx.fillRect(x + 10, y + 18, 1, 6);
      // Bottom panel inner shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 10, y + 24, 12, 1);
      ctx.fillRect(x + 21, y + 18, 1, 6);
      // Handle -- round knob (3x3 circle with highlight)
      ctx.fillStyle = "#d0b040";
      ctx.fillRect(x + 20, y + 15, 3, 1);
      ctx.fillRect(x + 19, y + 16, 1, 1);
      ctx.fillRect(x + 20, y + 16, 3, 1);
      ctx.fillRect(x + 23, y + 16, 1, 1);
      ctx.fillRect(x + 20, y + 17, 3, 1);
      // Knob highlight
      ctx.fillStyle = "#f0d860";
      ctx.fillRect(x + 20, y + 15, 1, 1);
      // Knob shadow
      ctx.fillStyle = "#a08830";
      ctx.fillRect(x + 22, y + 17, 1, 1);
      // Gap under the door (1px dark line)
      ctx.fillStyle = "#1a1a20";
      ctx.fillRect(x + 7, y + 28, 18, 1);
      // Door frame bottom shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 5, y + 30, 22, 1);
      // Right-side shadow from frame (2px cool-shifted strip)
      ctx.fillStyle = coolShadow(PAL.wood[2], 15);
      ctx.fillRect(x + 25, y + 4, 2, 24);
      // Brick hints at top corners
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x, y + 8, 4, 1);
      ctx.fillRect(x + 28, y + 14, 4, 1);
      ctx.fillRect(x + 1, y + 20, 3, 1);
      break;
    }

    case TILES.STOVE: {
      // Floor background
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // Stovepipe going up (6px wide)
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 12, y + 0, 8, 8);
      // Pipe highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 12, y + 0, 2, 8);
      // Pipe shadow
      ctx.fillStyle = PAL.metal[3];
      ctx.fillRect(x + 18, y + 0, 2, 8);
      // Stove body (iron) -- 24x20
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 4, y + 8, 24, 20);
      // Body highlight (left side)
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 4, y + 8, 2, 20);
      ctx.fillRect(x + 6, y + 8, 6, 2);
      // Body shadow (right side)
      ctx.fillStyle = PAL.metal[3];
      ctx.fillRect(x + 26, y + 8, 2, 20);
      ctx.fillRect(x + 20, y + 26, 8, 2);
      // Glowing embers on top
      ctx.fillStyle = "#c83020";
      ctx.fillRect(x + 8, y + 8, 16, 4);
      ctx.fillStyle = "#e86030";
      ctx.fillRect(x + 10, y + 8, 4, 2);
      ctx.fillRect(x + 18, y + 8, 4, 2);
      ctx.fillStyle = "#e8a040";
      ctx.fillRect(x + 12, y + 8, 2, 2);
      ctx.fillRect(x + 20, y + 8, 2, 2);
      ctx.fillStyle = "#f0c060";
      ctx.fillRect(x + 14, y + 9, 2, 1);
      // Stove door (12x8)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 10, y + 16, 12, 8);
      // Door frame
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 10, y + 16, 12, 2);
      ctx.fillRect(x + 10, y + 16, 2, 8);
      ctx.fillStyle = PAL.metal[3];
      ctx.fillRect(x + 20, y + 16, 2, 8);
      ctx.fillRect(x + 10, y + 22, 12, 2);
      // Door handle
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 14, y + 19, 4, 2);
      // Ash detail at base
      ctx.fillStyle = "#8a8880";
      ctx.fillRect(x + 6, y + 28, 8, 2);
      ctx.fillRect(x + 18, y + 28, 6, 2);
      // Top-left light edge on stove body
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 4, y + 8, 24, 1); // top edge highlight
      // Bottom-right shadow edge on stove body
      ctx.fillStyle = PAL.metal[3];
      ctx.fillRect(x + 4, y + 27, 24, 1); // bottom edge shadow
      ctx.fillRect(x + 27, y + 8, 1, 20); // right edge shadow
      // Ambient occlusion: shadow on floor below stove
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(x + 6, y + 28, 20, 2);
      break;
    }

    case TILES.BOOKSHELF: {
      // Floor background
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // Shelf frame (wood) -- 28x30
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 2, y + 0, 28, 30);
      // Frame highlight
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 2, y + 0, 28, 2);
      ctx.fillRect(x + 2, y + 0, 2, 30);
      // Frame shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 28, y + 0, 2, 30);
      ctx.fillRect(x + 2, y + 28, 28, 2);
      // Shelf dividers (2px thick)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 4, y + 10, 24, 2);
      ctx.fillRect(x + 4, y + 20, 24, 2);
      // Books top row -- varied widths and colors
      ctx.fillStyle = "#c85050"; // red
      ctx.fillRect(x + 4, y + 2, 4, 8);
      ctx.fillStyle = "#5a8a58"; // green
      ctx.fillRect(x + 8, y + 3, 4, 7);
      ctx.fillStyle = "#5070a0"; // blue
      ctx.fillRect(x + 12, y + 2, 5, 8);
      ctx.fillStyle = "#b89840"; // brown
      ctx.fillRect(x + 17, y + 3, 4, 7);
      ctx.fillStyle = "#d06060"; // warm red
      ctx.fillRect(x + 21, y + 2, 4, 8);
      ctx.fillStyle = "#6B5B4E"; // dark brown
      ctx.fillRect(x + 25, y + 4, 3, 6);
      // Book spine highlights (top row)
      ctx.fillStyle = "#e07070";
      ctx.fillRect(x + 4, y + 2, 2, 2);
      ctx.fillStyle = "#7aaa78";
      ctx.fillRect(x + 8, y + 3, 2, 2);
      ctx.fillStyle = "#6888b8";
      ctx.fillRect(x + 12, y + 2, 2, 2);
      // Books middle row
      ctx.fillStyle = "#6B5B4E"; // brown
      ctx.fillRect(x + 4, y + 12, 5, 8);
      ctx.fillStyle = "#e8c84a"; // yellow
      ctx.fillRect(x + 9, y + 12, 4, 8);
      ctx.fillStyle = "#5C6B7A"; // steel blue
      ctx.fillRect(x + 13, y + 12, 4, 8);
      ctx.fillStyle = "#d88a84"; // pink
      ctx.fillRect(x + 17, y + 13, 4, 7);
      ctx.fillStyle = "#5a8a58"; // green
      ctx.fillRect(x + 21, y + 12, 4, 8);
      ctx.fillStyle = "#8B4513"; // dark
      ctx.fillRect(x + 25, y + 14, 3, 6);
      // Book spine shine dots (middle row)
      ctx.fillStyle = "#f0d860";
      ctx.fillRect(x + 10, y + 12, 2, 2);
      ctx.fillStyle = "#e0a0a0";
      ctx.fillRect(x + 18, y + 13, 2, 2);
      // Books bottom row
      ctx.fillStyle = "#8B4513"; // dark brown
      ctx.fillRect(x + 4, y + 22, 4, 6);
      ctx.fillStyle = "#c85050"; // red
      ctx.fillRect(x + 8, y + 22, 5, 6);
      ctx.fillStyle = "#5070a0"; // blue
      ctx.fillRect(x + 13, y + 23, 4, 5);
      ctx.fillStyle = "#b89840"; // gold
      ctx.fillRect(x + 18, y + 22, 5, 6);
      ctx.fillStyle = "#d06060"; // warm red
      ctx.fillRect(x + 23, y + 24, 4, 4);
      // Leaning book
      ctx.fillStyle = "#5C6B7A";
      ctx.fillRect(x + 27, y + 22, 1, 6);
      ctx.fillRect(x + 26, y + 24, 1, 4);
      // Ambient occlusion: shadow on floor below bookshelf
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(x + 4, y + 28, 24, 2);
      break;
    }

    case TILES.BENCH: {
      // No background fill -- ground layer already provides the correct surface
      // Ambient occlusion: shadow under bench
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(x + 4, y + 24, 24, 2);
      // Bench seat (stone) -- 28x6
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 2, y + 12, 28, 6);
      // Seat highlight (2px)
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 2, y + 12, 28, 2);
      ctx.fillRect(x + 4, y + 14, 6, 1);
      // Seat shadow
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 2, y + 16, 28, 2);
      // Seat texture
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 14, y + 14, 4, 1);
      ctx.fillRect(x + 24, y + 14, 2, 1);
      ctx.fillRect(x + 8, y + 15, 3, 1);
      // Legs (4x6)
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 4, y + 18, 4, 6);
      ctx.fillRect(x + 24, y + 18, 4, 6);
      // Leg highlight
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 4, y + 18, 2, 6);
      ctx.fillRect(x + 24, y + 18, 2, 6);
      // Leg shadow
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 7, y + 22, 1, 2);
      ctx.fillRect(x + 27, y + 22, 1, 2);
      break;
    }

    // -- Nature tiles --
    case TILES.TREE_TOP: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);

      const treeLeaf = toArr(seasonPal.treeLeaf);

      if (seasonPal.showBareTree) {
        // Bare tree: 3-4 branching lines from center-bottom spreading upward
        const darkBark = treeLeaf[2];
        const lightBark = treeLeaf[1];
        // Central trunk top (2px wide at top)
        ctx.fillStyle = darkBark;
        ctx.fillRect(x + 15, y + 22, 2, 10);
        // Main left branch -- 2px wide at base tapering to 1px
        ctx.fillRect(x + 13, y + 18, 2, 6);
        ctx.fillRect(x + 11, y + 14, 2, 5);
        ctx.fillRect(x + 9, y + 10, 2, 5);
        ctx.fillRect(x + 7, y + 6, 1, 5);
        ctx.fillRect(x + 5, y + 3, 1, 4);
        // Main right branch
        ctx.fillRect(x + 17, y + 18, 2, 6);
        ctx.fillRect(x + 19, y + 14, 2, 5);
        ctx.fillRect(x + 21, y + 10, 2, 5);
        ctx.fillRect(x + 23, y + 6, 1, 5);
        ctx.fillRect(x + 25, y + 3, 1, 4);
        // Sub-branches (1px twigs)
        ctx.fillStyle = lightBark;
        ctx.fillRect(x + 8, y + 8, 1, 3); // left sub-twig
        ctx.fillRect(x + 6, y + 5, 1, 2);
        ctx.fillRect(x + 4, y + 2, 1, 2); // left tip
        ctx.fillRect(x + 10, y + 12, 1, 3);
        ctx.fillRect(x + 22, y + 8, 1, 3); // right sub-twig
        ctx.fillRect(x + 24, y + 5, 1, 2);
        ctx.fillRect(x + 26, y + 2, 1, 2); // right tip
        ctx.fillRect(x + 20, y + 12, 1, 3);
        // Inner sub-branches
        ctx.fillStyle = darkBark;
        ctx.fillRect(x + 13, y + 16, 1, 3);
        ctx.fillRect(x + 12, y + 12, 1, 4);
        ctx.fillRect(x + 11, y + 8, 1, 3);
        ctx.fillRect(x + 18, y + 16, 1, 3);
        ctx.fillRect(x + 19, y + 12, 1, 4);
        ctx.fillRect(x + 20, y + 8, 1, 3);
        // Highlight on left edges (light source top-left)
        ctx.fillStyle = lightBark;
        ctx.fillRect(x + 9, y + 10, 1, 2);
        ctx.fillRect(x + 5, y + 3, 1, 1);
        ctx.fillRect(x + 15, y + 22, 1, 4);
        // Snow dots if winter
        if (seasonPal.showSnow) {
          ctx.fillStyle = "#e8e8f0";
          ctx.fillRect(x + 5, y + 2, 2, 1);
          ctx.fillRect(x + 25, y + 2, 2, 1);
          ctx.fillRect(x + 10, y + 9, 2, 1);
          ctx.fillRect(x + 20, y + 9, 2, 1);
        }
      } else {
        // Lush canopy: overlapping circles/ovals with 4 green shades
        // Layer 1: Dark outline -- outermost ring of overlapping ovals
        ctx.fillStyle = treeLeaf[3];
        // Large central oval
        ctx.fillRect(x + 6, y + 2, 20, 2);
        ctx.fillRect(x + 4, y + 4, 24, 2);
        ctx.fillRect(x + 2, y + 6, 28, 2);
        ctx.fillRect(x + 0, y + 8, 32, 12);
        ctx.fillRect(x + 2, y + 20, 28, 2);
        ctx.fillRect(x + 4, y + 22, 24, 2);
        ctx.fillRect(x + 6, y + 24, 20, 2);
        ctx.fillRect(x + 10, y + 26, 12, 2);
        // Bumpy top edge (overlapping sub-circles)
        ctx.fillRect(x + 8, y + 0, 8, 2);
        ctx.fillRect(x + 18, y + 0, 6, 2);
        ctx.fillRect(x + 2, y + 4, 4, 3);
        ctx.fillRect(x + 26, y + 4, 4, 3);

        // Layer 2: Base green fill
        ctx.fillStyle = treeLeaf[1];
        ctx.fillRect(x + 8, y + 2, 16, 2);
        ctx.fillRect(x + 4, y + 4, 24, 2);
        ctx.fillRect(x + 2, y + 6, 28, 14);
        ctx.fillRect(x + 4, y + 20, 24, 2);
        ctx.fillRect(x + 6, y + 22, 20, 2);
        ctx.fillRect(x + 10, y + 24, 12, 2);
        // Bumpy sub-fills
        ctx.fillRect(x + 9, y + 1, 6, 2);
        ctx.fillRect(x + 19, y + 1, 4, 2);

        // Layer 3: Medium highlight -- random inner patches (leaf clusters)
        ctx.fillStyle = treeLeaf[0];
        // Top-left bright area (light source)
        ctx.fillRect(x + 7, y + 5, 6, 5);
        ctx.fillRect(x + 5, y + 7, 4, 4);
        ctx.fillRect(x + 10, y + 3, 5, 3);
        // Additional bright patches
        ctx.fillRect(x + 15, y + 8, 4, 3);
        ctx.fillRect(x + 10, y + 13, 3, 3);
        ctx.fillRect(x + 18, y + 5, 3, 2);

        // Layer 4: Brightest highlights (2-3 spots, top-left)
        const brightHighlight = treeLeaf[0];
        ctx.fillStyle = brightHighlight;
        ctx.fillRect(x + 8, y + 6, 3, 2);
        ctx.fillRect(x + 11, y + 4, 3, 2);
        ctx.fillRect(x + 6, y + 9, 2, 2);

        // Darker leaf clusters (mid-tone detail)
        ctx.fillStyle = treeLeaf[2];
        ctx.fillRect(x + 20, y + 12, 6, 5);
        ctx.fillRect(x + 14, y + 17, 5, 4);
        ctx.fillRect(x + 24, y + 8, 4, 6);
        ctx.fillRect(x + 4, y + 16, 5, 4);
        ctx.fillRect(x + 8, y + 20, 4, 3);
        ctx.fillRect(x + 22, y + 18, 4, 3);
        ctx.fillRect(x + 3, y + 12, 3, 4);
        ctx.fillRect(x + 26, y + 14, 3, 4);

        // Deep shadow spots bottom-right (cool-shifted)
        const coolShade = coolShadow(treeLeaf[3], 10);
        ctx.fillStyle = coolShade;
        ctx.fillRect(x + 22, y + 16, 4, 3);
        ctx.fillRect(x + 18, y + 20, 3, 2);
        ctx.fillRect(x + 26, y + 12, 3, 3);
        // Bottom shadow
        ctx.fillStyle = treeLeaf[3];
        ctx.fillRect(x + 8, y + 23, 16, 2);
        ctx.fillRect(x + 4, y + 20, 3, 2);

        // Dithered bottom transition to grass
        ditherRect(ctx, x + 6, y + 24, 20, 2, treeLeaf[2], PAL.grass[1]);
        ditherRect(ctx, x + 10, y + 26, 12, 2, treeLeaf[3], PAL.grass[1]);
        ditherRect(ctx, x + 4, y + 22, 3, 2, treeLeaf[2], PAL.grass[1]);
        ditherRect(ctx, x + 25, y + 22, 3, 2, treeLeaf[2], PAL.grass[1]);
      }
      break;
    }

    case TILES.TREE_TRUNK: {
      // Grass bg with variety
      drawGrassBg(ctx, x, y, s, PAL.grass);

      // Trunk: wider base (root flare) -- 12px at bottom, 8px at top
      // Main trunk body (tapered)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 12, y + 0, 8, 6); // top: 8px wide
      ctx.fillRect(x + 11, y + 6, 10, 6); // mid-upper: 10px
      ctx.fillRect(x + 10, y + 12, 12, 6); // mid-lower: 12px
      ctx.fillRect(x + 10, y + 18, 12, 6); // lower: 12px

      // Highlight strip on left edge (1px lighter)
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 12, y + 0, 1, 6);
      ctx.fillRect(x + 11, y + 6, 1, 6);
      ctx.fillRect(x + 10, y + 12, 1, 12);
      // Broader left highlight (2nd pixel)
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 13, y + 1, 1, 4);
      ctx.fillRect(x + 12, y + 7, 1, 4);
      ctx.fillRect(x + 11, y + 14, 1, 4);

      // Shadow strip on right edge (1px darker, cool-shifted)
      ctx.fillStyle = coolShadow(PAL.wood[3], 12);
      ctx.fillRect(x + 19, y + 0, 1, 6);
      ctx.fillRect(x + 20, y + 6, 1, 6);
      ctx.fillRect(x + 21, y + 12, 1, 12);
      // Deeper right shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 18, y + 2, 1, 3);
      ctx.fillRect(x + 19, y + 8, 1, 3);
      ctx.fillRect(x + 20, y + 14, 1, 4);

      // Bark texture: 4-5 short dark horizontal scratches
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 13, y + 3, 4, 1);
      ctx.fillRect(x + 14, y + 8, 3, 1);
      ctx.fillRect(x + 12, y + 13, 5, 1);
      ctx.fillRect(x + 13, y + 18, 4, 1);
      ctx.fillRect(x + 14, y + 22, 3, 1);
      // Bark highlight detail
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 13, y + 5, 2, 1);
      ctx.fillRect(x + 12, y + 10, 2, 1);
      ctx.fillRect(x + 12, y + 16, 3, 1);
      ctx.fillRect(x + 13, y + 20, 2, 1);

      // Root flare at bottom (wider, organic)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 8, y + 24, 16, 4);
      // Root tendrils extending into grass
      ctx.fillRect(x + 6, y + 26, 4, 3);
      ctx.fillRect(x + 22, y + 26, 4, 3);
      ctx.fillRect(x + 5, y + 28, 2, 2);
      ctx.fillRect(x + 25, y + 27, 2, 2);
      // Root highlight (left)
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 8, y + 24, 2, 2);
      ctx.fillRect(x + 6, y + 26, 2, 2);
      ctx.fillRect(x + 5, y + 28, 1, 1);
      // Root shadow (right)
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 22, y + 24, 2, 2);
      ctx.fillRect(x + 24, y + 26, 2, 2);
      ctx.fillRect(x + 26, y + 27, 1, 1);

      // Grass tufts around the base (3-4 green marks)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 3, y + 28, 2, 3);
      ctx.fillRect(x + 27, y + 27, 1, 3);
      ctx.fillRect(x + 9, y + 29, 1, 2);
      ctx.fillRect(x + 22, y + 29, 1, 2);
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 4, y + 27, 1, 2);
      ctx.fillRect(x + 28, y + 26, 1, 2);

      // Shadow at base on grass
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 6, y + 30, 20, 2);
      ditherRect(ctx, x + 4, y + 29, 3, 2, PAL.grass[3], PAL.grass[1]);
      ditherRect(ctx, x + 25, y + 29, 3, 2, PAL.grass[3], PAL.grass[1]);
      break;
    }

    case TILES.FLOWER_RED: {
      drawGrassBg(ctx, x, y, s, PAL.grass);
      const fs = seasonPal.flowerState;
      drawSingleFlower(
        ctx,
        x,
        y,
        7,
        10,
        26,
        "#C4706A",
        "#a05a54",
        "#e08880",
        "#e8c84a",
        PAL.grass,
        fs,
        PAL.dirt,
      );
      drawSingleFlower(
        ctx,
        x,
        y,
        17,
        7,
        26,
        "#C4706A",
        "#a05a54",
        "#e08880",
        "#e8c84a",
        PAL.grass,
        fs,
        PAL.dirt,
      );
      drawSingleFlower(
        ctx,
        x,
        y,
        26,
        9,
        26,
        "#C4706A",
        "#a05a54",
        "#e08880",
        "#e8c84a",
        PAL.grass,
        fs,
        PAL.dirt,
      );
      break;
    }

    case TILES.FLOWER_PINK: {
      drawGrassBg(ctx, x, y, s, PAL.grass);
      const fs = seasonPal.flowerState;
      drawSingleFlower(
        ctx,
        x,
        y,
        9,
        9,
        26,
        "#d88a84",
        "#b06a64",
        "#f0a8a0",
        "#e8c84a",
        PAL.grass,
        fs,
        PAL.dirt,
      );
      drawSingleFlower(
        ctx,
        x,
        y,
        17,
        11,
        26,
        "#d88a84",
        "#b06a64",
        "#f0a8a0",
        "#e8c84a",
        PAL.grass,
        fs,
        PAL.dirt,
      );
      drawSingleFlower(
        ctx,
        x,
        y,
        25,
        7,
        26,
        "#d88a84",
        "#b06a64",
        "#f0a8a0",
        "#e8c84a",
        PAL.grass,
        fs,
        PAL.dirt,
      );
      break;
    }

    case TILES.FLOWER_YELLOW: {
      drawGrassBg(ctx, x, y, s, PAL.grass);
      const fs = seasonPal.flowerState;
      drawSingleFlower(
        ctx,
        x,
        y,
        5,
        11,
        26,
        "#e8c84a",
        "#c0a030",
        "#f0d870",
        "#c85050",
        PAL.grass,
        fs,
        PAL.dirt,
      );
      drawSingleFlower(
        ctx,
        x,
        y,
        15,
        9,
        26,
        "#e8c84a",
        "#c0a030",
        "#f0d870",
        "#c85050",
        PAL.grass,
        fs,
        PAL.dirt,
      );
      drawSingleFlower(
        ctx,
        x,
        y,
        27,
        7,
        26,
        "#e8c84a",
        "#c0a030",
        "#f0d870",
        "#c85050",
        PAL.grass,
        fs,
        PAL.dirt,
      );
      break;
    }

    case TILES.FLOWER_PURPLE: {
      drawGrassBg(ctx, x, y, s, PAL.grass);
      const fs = seasonPal.flowerState;
      drawSingleFlower(
        ctx,
        x,
        y,
        7,
        9,
        26,
        "#e0a0d0",
        "#b070a0",
        "#f0c0e0",
        "#e8c84a",
        PAL.grass,
        fs,
        PAL.dirt,
      );
      drawSingleFlower(
        ctx,
        x,
        y,
        19,
        7,
        26,
        "#e0a0d0",
        "#b070a0",
        "#f0c0e0",
        "#e8c84a",
        PAL.grass,
        fs,
        PAL.dirt,
      );
      drawSingleFlower(
        ctx,
        x,
        y,
        27,
        11,
        26,
        "#e0a0d0",
        "#b070a0",
        "#f0c0e0",
        "#e8c84a",
        PAL.grass,
        fs,
        PAL.dirt,
      );
      break;
    }

    case TILES.BAMBOO: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Stem 1 (left, 4px wide)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 4, y, 4, s);
      ctx.fillStyle = PAL.grass[0]; // highlight left
      ctx.fillRect(x + 4, y, 2, s);
      ctx.fillStyle = PAL.grass[3]; // shadow right
      ctx.fillRect(x + 6, y, 2, s);
      // Stem 2 (center, 4px wide)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 14, y, 4, s);
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 14, y, 2, s);
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 16, y, 2, s);
      // Stem 3 (right, 4px wide)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 24, y, 4, s);
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 24, y, 2, s);
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 26, y, 2, s);
      // Nodes (horizontal bands, 2px) -- every 8px
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 4, y + 8, 4, 2);
      ctx.fillRect(x + 4, y + 20, 4, 2);
      ctx.fillRect(x + 14, y + 4, 4, 2);
      ctx.fillRect(x + 14, y + 16, 4, 2);
      ctx.fillRect(x + 14, y + 28, 4, 2);
      ctx.fillRect(x + 24, y + 10, 4, 2);
      ctx.fillRect(x + 24, y + 24, 4, 2);
      // Node highlights
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 4, y + 6, 2, 2);
      ctx.fillRect(x + 14, y + 2, 2, 2);
      ctx.fillRect(x + 24, y + 8, 2, 2);
      // Leaves branching off nodes at 45 degree angles (4-6 leaves)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 8, y + 6, 4, 2);
      ctx.fillRect(x + 10, y + 4, 2, 2);
      ctx.fillRect(x + 0, y + 18, 4, 2);
      ctx.fillRect(x + 2, y + 16, 2, 2);
      ctx.fillRect(x + 18, y + 2, 4, 2);
      ctx.fillRect(x + 20, y + 0, 2, 2);
      ctx.fillRect(x + 10, y + 14, 4, 2);
      ctx.fillRect(x + 12, y + 12, 2, 2);
      ctx.fillRect(x + 20, y + 22, 4, 2);
      ctx.fillRect(x + 22, y + 20, 2, 2);
      ctx.fillRect(x + 28, y + 8, 3, 2);
      ctx.fillRect(x + 29, y + 6, 2, 2);
      // Leaf shadows
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 11, y + 6, 2, 2);
      ctx.fillRect(x + 21, y + 2, 2, 2);
      ctx.fillRect(x + 30, y + 8, 1, 2);
      break;
    }

    // -- Structure tiles --
    case TILES.FLAG_POLE: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Grass detail
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 2, y + 24, 1, 3);
      ctx.fillRect(x + 26, y + 22, 1, 4);
      ctx.fillRect(x + 8, y + 28, 1, 2);
      // Pole (3px wide)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 14, y + 6, 3, 26);
      // Pole highlight (left edge)
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 14, y + 6, 1, 26);
      // Pole shadow (right)
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 16, y + 6, 1, 26);
      // Gold finial at top (6px)
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 12, y + 4, 7, 3);
      ctx.fillRect(x + 13, y + 2, 5, 2);
      ctx.fillStyle = "#d0b040";
      ctx.fillRect(x + 14, y + 0, 3, 2);
      // Finial highlight
      ctx.fillStyle = "#f0d860";
      ctx.fillRect(x + 14, y + 2, 2, 2);
      ctx.fillRect(x + 13, y + 4, 1, 1);
      // Red flag (wave shape -- 12x8)
      ctx.fillStyle = "#c83030";
      ctx.fillRect(x + 17, y + 6, 10, 2);
      ctx.fillRect(x + 17, y + 8, 12, 2);
      ctx.fillRect(x + 17, y + 10, 12, 2);
      ctx.fillRect(x + 17, y + 12, 10, 2);
      ctx.fillRect(x + 17, y + 14, 8, 2);
      // Flag highlight
      ctx.fillStyle = "#e84040";
      ctx.fillRect(x + 19, y + 8, 6, 2);
      ctx.fillRect(x + 19, y + 10, 4, 2);
      // Flag shadow
      ctx.fillStyle = "#a02020";
      ctx.fillRect(x + 17, y + 14, 4, 2);
      // Pole base shadow
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 12, y + 30, 8, 2);
      // Ambient occlusion: subtle circular shadow at base
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(x + 11, y + 30, 10, 2);
      ctx.fillRect(x + 13, y + 29, 6, 1);
      break;
    }

    case TILES.BASKETBALL_HOOP: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Dirt speckles
      ctx.fillStyle = PAL.dirt[2];
      ctx.fillRect(x + 4, y + 26, 2, 2);
      ctx.fillRect(x + 24, y + 28, 2, 2);
      ctx.fillRect(x + 14, y + 30, 1, 1);
      // Metal pole (3px wide)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 14, y + 14, 3, 18);
      // Pole highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 14, y + 14, 1, 18);
      // White backboard (20x12)
      ctx.fillStyle = "#e8e8e8";
      ctx.fillRect(x + 6, y + 2, 20, 12);
      // Backboard border (2px)
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 6, y + 2, 20, 2); // top
      ctx.fillRect(x + 6, y + 2, 2, 12); // left
      ctx.fillRect(x + 24, y + 2, 2, 12); // right
      ctx.fillRect(x + 6, y + 12, 20, 2); // bottom
      // Red square outline on backboard
      ctx.fillStyle = "#c83030";
      ctx.fillRect(x + 12, y + 4, 8, 2);
      ctx.fillRect(x + 12, y + 4, 2, 6);
      ctx.fillRect(x + 18, y + 4, 2, 6);
      ctx.fillRect(x + 12, y + 8, 8, 2);
      // Orange rim (12px wide)
      ctx.fillStyle = "#e07030";
      ctx.fillRect(x + 10, y + 14, 12, 2);
      // Net suggestion (chain-like)
      ctx.fillStyle = "#d0d0d0";
      ctx.fillRect(x + 12, y + 16, 1, 4);
      ctx.fillRect(x + 16, y + 16, 1, 4);
      ctx.fillRect(x + 20, y + 16, 1, 4);
      ctx.fillRect(x + 14, y + 18, 1, 4);
      ctx.fillRect(x + 18, y + 18, 1, 4);
      ctx.fillRect(x + 13, y + 20, 1, 2);
      ctx.fillRect(x + 15, y + 21, 1, 2);
      ctx.fillRect(x + 17, y + 20, 1, 2);
      ctx.fillRect(x + 19, y + 21, 1, 2);
      // Shadow on ground
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 10, y + 30, 12, 2);
      break;
    }

    case TILES.WATER_TOWER_TOP: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Cylindrical tank -- rounded top (~20px wide)
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 8, y + 2, 16, 2);
      ctx.fillRect(x + 6, y + 4, 20, 2);
      ctx.fillRect(x + 4, y + 6, 24, 20);
      ctx.fillRect(x + 6, y + 26, 20, 2);
      ctx.fillRect(x + 8, y + 28, 16, 2);
      // Metal sheen -- highlight on left
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 8, y + 4, 4, 2);
      ctx.fillRect(x + 6, y + 6, 4, 16);
      ctx.fillRect(x + 10, y + 8, 2, 8);
      // Shadow on right
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 22, y + 6, 4, 16);
      ctx.fillRect(x + 24, y + 8, 2, 12);
      // Rivet/band detail
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 6, y + 12, 20, 2);
      ctx.fillRect(x + 6, y + 20, 20, 2);
      // Rivet dots
      ctx.fillRect(x + 8, y + 12, 2, 2);
      ctx.fillRect(x + 16, y + 12, 2, 2);
      ctx.fillRect(x + 24, y + 12, 2, 2);
      ctx.fillRect(x + 12, y + 20, 2, 2);
      ctx.fillRect(x + 20, y + 20, 2, 2);
      // Band highlight above rivet
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 8, y + 10, 8, 2);
      ctx.fillRect(x + 8, y + 18, 8, 2);
      // Rim at bottom
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 6, y + 28, 20, 2);
      break;
    }

    case TILES.WATER_TOWER_BASE: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Main support column (8px wide)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 12, y, 8, s);
      // Column highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 12, y, 2, s);
      // Column shadow
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 18, y, 2, s);
      // Cross beams
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 6, y + 8, 20, 2);
      ctx.fillRect(x + 4, y + 20, 24, 2);
      // Cross-brace legs (angled supports)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 8, y + 10, 2, 10);
      ctx.fillRect(x + 6, y + 14, 2, 6);
      ctx.fillRect(x + 22, y + 10, 2, 10);
      ctx.fillRect(x + 24, y + 14, 2, 6);
      // Leg flare at bottom
      ctx.fillRect(x + 4, y + 22, 4, 10);
      ctx.fillRect(x + 24, y + 22, 4, 10);
      // Leg highlights
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 4, y + 22, 2, 10);
      ctx.fillRect(x + 24, y + 22, 2, 10);
      // Shadow
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 2, y + 30, 28, 2);
      break;
    }

    case TILES.WATER_TAP: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Grass detail
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 2, y + 26, 1, 3);
      ctx.fillRect(x + 28, y + 22, 1, 4);
      // Stone base (16x10)
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 8, y + 20, 16, 10);
      // Base highlight
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 8, y + 20, 16, 2);
      ctx.fillRect(x + 8, y + 20, 2, 10);
      // Base shadow
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 22, y + 20, 2, 10);
      ctx.fillRect(x + 8, y + 28, 16, 2);
      // Metal pipe (4px wide)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 14, y + 4, 4, 16);
      // Pipe highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 14, y + 4, 2, 16);
      // Pipe shadow
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 16, y + 4, 2, 16);
      // Tap head / handle (12x4)
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 10, y + 4, 12, 4);
      // Handle highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 10, y + 4, 12, 2);
      // Spout (6x4)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 18, y + 10, 6, 4);
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 18, y + 10, 6, 2);
      // Water drip (2-3 blue pixels)
      ctx.fillStyle = "#68a8d0";
      ctx.fillRect(x + 22, y + 14, 2, 2);
      ctx.fillStyle = "#88c8e8";
      ctx.fillRect(x + 22, y + 16, 2, 2);
      ctx.fillStyle = "#a0d8f0";
      ctx.fillRect(x + 23, y + 18, 1, 1);
      // Shadow on grass
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 6, y + 30, 20, 2);
      // Ambient occlusion: shadow at base of stone
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(x + 8, y + 28, 16, 2);
      break;
    }

    case TILES.GATE_PILLAR: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Pillar body (stone/brick) -- 20x26
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 6, y + 6, 20, 26);
      // Pillar highlight (left, 2px)
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 6, y + 6, 2, 26);
      ctx.fillRect(x + 8, y + 6, 6, 2);
      // Pillar shadow (right, 2px)
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 24, y + 6, 2, 26);
      ctx.fillRect(x + 18, y + 30, 8, 2);
      // Cap on top (24x6)
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 4, y + 0, 24, 6);
      // Cap highlight
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 4, y + 0, 24, 2);
      // Cap shadow
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 4, y + 4, 24, 2);
      // Mortar lines (between stone blocks)
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 6, y + 14, 20, 2);
      ctx.fillRect(x + 6, y + 22, 20, 2);
      // Mortar highlights
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 8, y + 8, 4, 2);
      ctx.fillRect(x + 8, y + 16, 4, 2);
      ctx.fillRect(x + 8, y + 24, 4, 2);
      // Vertical mortar
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 16, y + 6, 2, 8);
      ctx.fillRect(x + 12, y + 16, 2, 6);
      ctx.fillRect(x + 20, y + 24, 2, 8);
      // Ground shadow
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 4, y + 30, 24, 2);
      break;
    }

    case TILES.GATE_BAR: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Dirt detail
      ctx.fillStyle = PAL.dirt[2];
      ctx.fillRect(x + 6, y + 28, 2, 2);
      ctx.fillRect(x + 22, y + 26, 2, 2);
      // Horizontal bars (metal, 4px tall each)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x, y + 6, s, 4);
      ctx.fillRect(x, y + 18, s, 4);
      // Bar highlights (top of each bar, 2px)
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x, y + 6, s, 2);
      ctx.fillRect(x, y + 18, s, 2);
      // Bar shadows (bottom of each bar, 2px)
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x, y + 8, s, 2);
      ctx.fillRect(x, y + 20, s, 2);
      // Vertical supports (2px wide)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 6, y + 6, 2, 16);
      ctx.fillRect(x + 16, y + 6, 2, 16);
      ctx.fillRect(x + 26, y + 6, 2, 16);
      // Support highlights
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 6, y + 10, 1, 2);
      ctx.fillRect(x + 16, y + 10, 1, 2);
      ctx.fillRect(x + 26, y + 10, 1, 2);
      // Arrow/finial tips on vertical bars
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 6, y + 4, 2, 2);
      ctx.fillRect(x + 16, y + 4, 2, 2);
      ctx.fillRect(x + 26, y + 4, 2, 2);
      // Shadow on ground
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 4, y + 24, 4, 2);
      ctx.fillRect(x + 14, y + 24, 4, 2);
      ctx.fillRect(x + 24, y + 24, 4, 2);
      break;
    }

    default: {
      // Fallback: solid fill with detail speckles
      const c = config.color;
      const d = config.detail || c;
      ctx.fillStyle = c;
      ctx.fillRect(x, y, s, s);
      if (config.detail) {
        ctx.fillStyle = d;
        ctx.fillRect(x + 6, y + 6, 4, 4);
        ctx.fillRect(x + 20, y + 16, 4, 4);
        ctx.fillRect(x + 12, y + 24, 4, 4);
      }
      break;
    }
  }
}
