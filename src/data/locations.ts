export interface Location {
  id: string;
  name: string;
  type: "school" | "village" | "town" | "road";
  connections: string[]; // IDs of connected locations
}

export const locations: Location[] = [
  // School
  {
    id: "classroom",
    name: "教室",
    type: "school",
    connections: ["playground", "office", "flower-pool"],
  },
  {
    id: "playground",
    name: "操场",
    type: "school",
    connections: ["classroom", "water-tower", "flower-pool", "village-road"],
  },
  {
    id: "office",
    name: "办公室",
    type: "school",
    connections: ["classroom"],
  },
  {
    id: "flower-pool",
    name: "花池",
    type: "school",
    connections: ["classroom", "playground"],
  },
  {
    id: "water-tower",
    name: "水塔",
    type: "school",
    connections: ["playground"],
  },

  // Village
  {
    id: "village-road",
    name: "村路",
    type: "village",
    connections: ["playground", "farmland", "villager-house", "town-road", "home"],
  },
  {
    id: "farmland",
    name: "农田",
    type: "village",
    connections: ["village-road"],
  },
  {
    id: "villager-house",
    name: "村民家",
    type: "village",
    connections: ["village-road"],
  },

  {
    id: "home",
    name: "家",
    type: "village",
    connections: ["village-road"],
  },

  // Town
  {
    id: "town-road",
    name: "镇上",
    type: "town",
    connections: ["village-road", "post-office", "market", "clinic"],
  },
  {
    id: "post-office",
    name: "邮局",
    type: "town",
    connections: ["town-road"],
  },
  {
    id: "market",
    name: "集市",
    type: "town",
    connections: ["town-road"],
  },
  {
    id: "clinic",
    name: "卫生所",
    type: "town",
    connections: ["town-road"],
  },
];

export function getLocation(id: string): Location | undefined {
  return locations.find((l) => l.id === id);
}

export function getConnectedLocations(id: string): Location[] {
  const loc = getLocation(id);
  if (!loc) return [];
  return loc.connections.map((cid) => getLocation(cid)).filter(Boolean) as Location[];
}
