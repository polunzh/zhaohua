export interface RouteStop {
  locationId: string;
  name: string;
  stayMinutes: number;
}

export const postmanRoute: RouteStop[] = [
  { locationId: "post-office", name: "邮局", stayMinutes: 30 },
  { locationId: "town-road", name: "镇上", stayMinutes: 15 },
  { locationId: "village-road", name: "村路", stayMinutes: 15 },
  { locationId: "villager-house", name: "村民家", stayMinutes: 20 },
  { locationId: "playground", name: "学校", stayMinutes: 15 },
  { locationId: "village-road", name: "回程", stayMinutes: 15 },
  { locationId: "town-road", name: "回镇", stayMinutes: 15 },
  { locationId: "post-office", name: "回邮局", stayMinutes: 0 },
];

export function getPostmanStop(hour: number, minute: number): RouteStop {
  // Route starts at 8:00, calculate which stop based on elapsed time
  const startMinute = 8 * 60;
  const currentMinute = hour * 60 + minute;
  const elapsed = currentMinute - startMinute;

  if (elapsed < 0) return postmanRoute[0]; // Before route start

  let accumulated = 0;
  for (const stop of postmanRoute) {
    accumulated += stop.stayMinutes + 15; // 15 min travel between stops
    if (elapsed < accumulated) return stop;
  }
  return postmanRoute[postmanRoute.length - 1]; // Route done, back at post office
}
