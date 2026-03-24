<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { Application, Texture, Sprite, Container, Graphics, Text, TextStyle } from "pixi.js";
import { TILE_SIZE } from "../tilemap/types";
import type { TileMapData } from "../tilemap/types";
import { TileMapEngine } from "../tilemap/engine";
import { TILES, getTileConfig } from "../tilemap/tileset";
import { getSeasonalPalette } from "../tilemap/season-palette";
import { drawTile } from "../tilemap/tile-renderer";
import { drawCharacter, getSpriteConfig, SPRITE_WIDTH, SPRITE_HEIGHT } from "../tilemap/sprites";

const props = defineProps<{
  mapData: TileMapData | null;
  npcs: {
    id: string;
    name: string;
    location: string;
    mood: string;
    tileX?: number;
    tileY?: number;
  }[];
  activeCharacter: string;
  currentScene: string;
  season?: string;
}>();

const emit = defineEmits<{
  clickTile: [tileX: number, tileY: number];
  clickNpc: [npcId: string];
  clickExit: [targetMapId: string];
  clickObject: [tileName: string];
}>();

const containerRef = ref<HTMLDivElement>();
let app: Application | null = null;
let engine: TileMapEngine | null = null;
let tileTextures: Map<number, Texture> = new Map();
let currentSeason = "";
let currentScale = 1;

function createTileTexture(tileId: number, pal: ReturnType<typeof getSeasonalPalette>): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = TILE_SIZE;
  canvas.height = TILE_SIZE;
  const ctx = canvas.getContext("2d")!;
  drawTile(ctx, tileId, 0, 0, TILE_SIZE, pal);
  const tex = Texture.from(canvas);
  tex.source.scaleMode = "nearest";
  return tex;
}

function createNpcTexture(npcId: string, mood: string, name: string): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE_WIDTH;
  canvas.height = SPRITE_HEIGHT + 20;
  const ctx = canvas.getContext("2d")!;
  const config = getSpriteConfig(npcId);
  if (config) {
    drawCharacter(ctx, 0, 0, config, "down", name, mood);
  }
  const tex = Texture.from(canvas);
  tex.source.scaleMode = "nearest";
  return tex;
}

function buildTileTextures(season: string) {
  tileTextures.forEach((tex) => tex.destroy(true));
  tileTextures.clear();
  const pal = getSeasonalPalette(season);
  const allIds = Object.values(TILES).filter((id) => id !== 0);
  for (const id of allIds) {
    tileTextures.set(id, createTileTexture(id, pal));
  }
  currentSeason = season;
}

const destNames: Record<string, string> = {
  classroom: "教室",
  office: "办公室",
  playground: "操场",
  "flower-pool": "花池",
  "water-tower": "水塔",
  "village-road": "村路",
  farmland: "农田",
  "villager-house": "村民家",
  "town-road": "镇上",
  "post-office": "邮局",
  market: "集市",
  clinic: "卫生所",
  "home-zhang": "张家",
  "home-wang": "王家",
  "home-li": "李家",
  "home-zhao": "赵家",
  "home-zhu": "朱家",
};

async function render() {
  if (!containerRef.value || !props.mapData) return;

  const mapData = props.mapData;
  engine = new TileMapEngine(mapData);

  const mapW = mapData.width * TILE_SIZE;
  const mapH = mapData.height * TILE_SIZE;

  const parentW = containerRef.value.clientWidth || 800;
  const parentH = containerRef.value.clientHeight || 600;
  const scaleX = Math.floor(parentW / mapW) || 1;
  const scaleY = Math.floor(parentH / mapH) || 1;
  currentScale = Math.max(1, Math.min(scaleX, scaleY, 4));

  const season = props.season || "summer";
  if (season !== currentSeason) {
    buildTileTextures(season);
  }

  if (app) {
    app.destroy(true);
  }

  app = new Application();
  await app.init({
    width: mapW * currentScale,
    height: mapH * currentScale,
    backgroundColor: 0x2e2a26,
    antialias: false,
    roundPixels: true,
  });

  containerRef.value.innerHTML = "";
  const canvas = app.canvas as HTMLCanvasElement;
  canvas.style.imageRendering = "pixelated";
  canvas.style.cursor = "default";
  containerRef.value.appendChild(canvas);

  const root = new Container();
  root.scale.set(currentScale);
  app.stage.addChild(root);

  // Ground layer
  for (let y = 0; y < mapData.height; y++) {
    for (let x = 0; x < mapData.width; x++) {
      const tileId = mapData.ground[y][x];
      const tex = tileTextures.get(tileId);
      if (tex) {
        const sprite = new Sprite(tex);
        sprite.x = x * TILE_SIZE;
        sprite.y = y * TILE_SIZE;
        root.addChild(sprite);
      }
    }
  }

  // Object layer
  for (let y = 0; y < mapData.height; y++) {
    for (let x = 0; x < mapData.width; x++) {
      const tileId = mapData.objects[y][x];
      if (tileId === 0) continue;
      const tex = tileTextures.get(tileId);
      if (tex) {
        const sprite = new Sprite(tex);
        sprite.x = x * TILE_SIZE;
        sprite.y = y * TILE_SIZE;
        root.addChild(sprite);
      }
    }
  }

  // Exit labels
  for (const exit of mapData.exits) {
    const label = destNames[exit.targetMapId] || exit.targetMapId;
    const text = new Text({
      text: "→" + label,
      style: new TextStyle({
        fontSize: 10,
        fill: 0xf5e6c8,
        fontFamily: '"Noto Serif SC", serif',
      }),
    });
    text.x = exit.tileX * TILE_SIZE + TILE_SIZE / 2;
    text.y = exit.tileY * TILE_SIZE - 4;
    text.anchor.set(0.5, 1);
    text.alpha = 0.7;
    root.addChild(text);
  }

  // NPC sprites with glow
  for (const npc of props.npcs) {
    if (npc.tileX === undefined || npc.tileY === undefined) continue;

    // Glow ellipse under NPC
    const glow = new Graphics();
    glow.ellipse(0, 0, 18, 6);
    glow.fill({ color: 0xc4706a, alpha: 0.15 });
    glow.x = npc.tileX * TILE_SIZE + SPRITE_WIDTH / 2;
    glow.y = npc.tileY * TILE_SIZE + TILE_SIZE - 4;
    root.addChild(glow);

    // Character sprite
    const tex = createNpcTexture(npc.id, npc.mood, npc.name);
    const sprite = new Sprite(tex);
    sprite.x = npc.tileX * TILE_SIZE;
    sprite.y = npc.tileY * TILE_SIZE - TILE_SIZE;
    root.addChild(sprite);
  }

  // Vignette overlay
  const vignette = new Graphics();
  vignette.rect(0, 0, mapW, mapH);
  vignette.fill({ color: 0x000000, alpha: 0 });
  // Simple corner darkening
  const cornerSize = Math.min(mapW, mapH) * 0.4;
  for (let i = 0; i < 8; i++) {
    const alpha = 0.02 * (8 - i);
    const offset = i * (cornerSize / 8);
    vignette.rect(0, 0, mapW, offset);
    vignette.fill({ color: 0x2e1a10, alpha });
  }
  root.addChild(vignette);

  // Event handling
  app.stage.eventMode = "static";
  app.stage.hitArea = { contains: () => true };

  app.stage.on("pointerdown", (e: any) => {
    const localX = e.global.x / currentScale;
    const localY = e.global.y / currentScale;
    if (!engine) return;
    const { tileX, tileY } = engine.pixelToTile(localX, localY);

    for (const npc of props.npcs) {
      if (npc.tileX === tileX && (npc.tileY === tileY || npc.tileY === tileY + 1)) {
        emit("clickNpc", npc.id);
        return;
      }
    }
    const exit = engine.getExitAt(tileX, tileY);
    if (exit) {
      emit("clickExit", exit.targetMapId);
      return;
    }
    const objId = engine.getObjectTile(tileX, tileY);
    if (objId !== 0) {
      const config = getTileConfig(objId);
      if (config) {
        emit("clickObject", config.name);
        return;
      }
    }
    emit("clickTile", tileX, tileY);
  });

  app.stage.on("pointermove", (e: any) => {
    const localX = e.global.x / currentScale;
    const localY = e.global.y / currentScale;
    if (!engine) return;
    const { tileX, tileY } = engine.pixelToTile(localX, localY);

    let cursor = "default";
    for (const npc of props.npcs) {
      if (npc.tileX === tileX && (npc.tileY === tileY || npc.tileY === tileY + 1)) {
        cursor = "pointer";
        break;
      }
    }
    if (cursor === "default" && engine.getExitAt(tileX, tileY)) cursor = "pointer";
    if (cursor === "default") {
      const objId = engine.getObjectTile(tileX, tileY);
      if (objId !== 0) cursor = "pointer";
    }
    canvas.style.cursor = cursor;
  });
}

onMounted(() => {
  if (props.mapData) {
    buildTileTextures(props.season || "summer");
    render();
  }
});

watch(
  () => [props.currentScene, props.season, props.mapData, props.npcs.length],
  () => render(),
);

onUnmounted(() => {
  if (app) app.destroy(true);
  tileTextures.forEach((tex) => tex.destroy(true));
});
</script>

<template>
  <div ref="containerRef" class="pixi-canvas" />
</template>

<style scoped>
.pixi-canvas {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
