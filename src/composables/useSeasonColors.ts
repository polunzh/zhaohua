import { getSeasonalPalette } from "../tilemap/season-palette";

export interface SceneColors {
  grass: string;
  dirt: string;
  treeLeaf: string;
  treeLeafHighlight: string;
  treeTrunk: string;
  sky: string;
  flowerState: "bud" | "bloom" | "wilt" | "bare";
  showSnow: boolean;
  showBareTree: boolean;
  flowerColors: string[];
}

const skyColors: Record<string, string> = {
  spring: "#d0dcc0",
  summer: "#c8d0b8",
  autumn: "#d8d0b8",
  winter: "#c8c8c8",
};

const flowerColorsBySeason: Record<string, string[]> = {
  spring: ["#d8a8a8", "#e0c888", "#c8a8c0"], // muted buds
  summer: ["#c8787a", "#d4b868", "#b890b0", "#c87878", "#d0a050"], // vibrant blooms
  autumn: ["#b89878", "#a89068", "#988060"], // faded/wilted
  winter: [], // bare
};

export function getSceneColors(season: string): SceneColors {
  const palette = getSeasonalPalette(season);
  return {
    grass: palette.grass.base,
    dirt: palette.dirt.base,
    treeLeaf: palette.treeLeaf.base,
    treeLeafHighlight: palette.treeLeaf.light,
    treeTrunk: "#8a7050",
    sky: skyColors[season] || skyColors.summer,
    flowerState: palette.flowerState,
    showSnow: palette.showSnow,
    showBareTree: palette.showBareTree,
    flowerColors: flowerColorsBySeason[season] || flowerColorsBySeason.summer,
  };
}
