export interface SeasonConfig {
  name: string;
  months: number[];
  weatherWeights: Record<string, number>;
}

export const seasons: Record<string, SeasonConfig> = {
  spring: {
    name: "春",
    months: [3, 4, 5],
    weatherWeights: { sunny: 0.5, cloudy: 0.3, rainy: 0.2 },
  },
  summer: {
    name: "夏",
    months: [6, 7, 8],
    weatherWeights: { sunny: 0.6, cloudy: 0.2, rainy: 0.2 },
  },
  autumn: {
    name: "秋",
    months: [9, 10, 11],
    weatherWeights: { sunny: 0.5, cloudy: 0.3, rainy: 0.15, windy: 0.05 },
  },
  winter: {
    name: "冬",
    months: [12, 1, 2],
    weatherWeights: { sunny: 0.3, cloudy: 0.3, snowy: 0.2, windy: 0.2 },
  },
};
