export interface MaterialPalette {
  light: string;
  base: string;
  dark: string;
  shadow: string;
}

export interface SeasonalPalette {
  grass: MaterialPalette;
  dirt: MaterialPalette;
  brick: MaterialPalette;
  wood: MaterialPalette;
  floor: MaterialPalette;
  stone: MaterialPalette;
  metal: MaterialPalette;
  treeLeaf: MaterialPalette; // separate from grass for trees
  showSnow: boolean;
  showBareTree: boolean;
  flowerState: "bud" | "bloom" | "wilt" | "bare";
}

const summerPalette: SeasonalPalette = {
  grass: { light: "#9abc96", base: "#7A9178", dark: "#5a7a58", shadow: "#4a6a48" },
  dirt: { light: "#dcd0a8", base: "#D4C08E", dark: "#C9A882", shadow: "#b89870" },
  brick: { light: "#d89088", base: "#C4706A", dark: "#a05a54", shadow: "#8a4a44" },
  wood: { light: "#b89840", base: "#8B6914", dark: "#6B5B4E", shadow: "#5a4a3e" },
  floor: { light: "#f5ecd8", base: "#F5E6C8", dark: "#e8d8b0", shadow: "#d4c898" },
  stone: { light: "#c0d0c8", base: "#A8B8B0", dark: "#8a9a92", shadow: "#6a7a72" },
  metal: { light: "#7888a0", base: "#5C6B7A", dark: "#4a5868", shadow: "#3a4858" },
  treeLeaf: { light: "#8aac86", base: "#5a7a58", dark: "#4a6a48", shadow: "#3a5a38" },
  showSnow: false,
  showBareTree: false,
  flowerState: "bloom",
};

const springPalette: SeasonalPalette = {
  ...summerPalette,
  grass: { light: "#a8d8a0", base: "#88bc88", dark: "#68a068", shadow: "#508850" },
  treeLeaf: { light: "#a8d8a0", base: "#90b890", dark: "#70a070", shadow: "#508850" },
  flowerState: "bud",
};

const autumnPalette: SeasonalPalette = {
  ...summerPalette,
  grass: { light: "#c8b878", base: "#b8a060", dark: "#a08848", shadow: "#887038" },
  dirt: { light: "#d8c898", base: "#c8b078", dark: "#b09860", shadow: "#988050" },
  treeLeaf: { light: "#d8a040", base: "#c88830", dark: "#b07020", shadow: "#985818" },
  flowerState: "wilt",
};

const winterPalette: SeasonalPalette = {
  ...summerPalette,
  grass: { light: "#b8b0a0", base: "#a89878", dark: "#988868", shadow: "#887858" },
  dirt: { light: "#d0c8c0", base: "#c0b8b0", dark: "#b0a8a0", shadow: "#a09890" },
  treeLeaf: { light: "#8a7a68", base: "#7a6a58", dark: "#6a5a48", shadow: "#5a4a38" },
  showSnow: true,
  showBareTree: true,
  flowerState: "bare",
};

export function getSeasonalPalette(season: string): SeasonalPalette {
  switch (season) {
    case "spring":
      return springPalette;
    case "autumn":
      return autumnPalette;
    case "winter":
      return winterPalette;
    default:
      return summerPalette;
  }
}
