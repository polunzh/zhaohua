import type { NPC } from "../data/npcs";

export interface ScheduleEntry {
  location: string;
  activity: string;
}

function timeToMinutes(hour: number, minute: number): number {
  return hour * 60 + minute;
}

function getStudentSchedule(time: number, season?: string): ScheduleEntry {
  // before 7:00 — home
  if (time < timeToMinutes(7, 0)) {
    return { location: "home", activity: "sleeping" };
  }
  // 7:00-7:29 — road to school
  if (time < timeToMinutes(7, 30)) {
    return { location: "road", activity: "walking-to-school" };
  }
  // 7:30-9:44 — class
  if (time < timeToMinutes(9, 45)) {
    return { location: "classroom", activity: "in-class" };
  }
  // 9:45-10:14 — break (season-specific: water-tower in summer)
  if (time < timeToMinutes(10, 15)) {
    if (season === "summer") {
      return { location: "water-tower", activity: "drinking-water" };
    }
    return { location: "playground", activity: "break" };
  }
  // 10:15-11:59 — class
  if (time < timeToMinutes(12, 0)) {
    return { location: "classroom", activity: "in-class" };
  }
  // 12:00-13:59 — home for lunch
  if (time < timeToMinutes(14, 0)) {
    return { location: "home", activity: "lunch" };
  }
  // 14:00-15:44 — class
  if (time < timeToMinutes(15, 45)) {
    return { location: "classroom", activity: "in-class" };
  }
  // 15:45-16:14 — break
  if (time < timeToMinutes(16, 15)) {
    if (season === "summer") {
      return { location: "water-tower", activity: "drinking-water" };
    }
    return { location: "playground", activity: "break" };
  }
  // 16:15-17:00 — class
  if (time <= timeToMinutes(17, 0)) {
    return { location: "classroom", activity: "in-class" };
  }
  // 17:01-17:30 — road home
  if (time <= timeToMinutes(17, 30)) {
    return { location: "road", activity: "walking-home" };
  }
  // after 17:30 — home
  return { location: "home", activity: "resting" };
}

function getPrincipalSchedule(time: number): ScheduleEntry {
  // before 7:00 — home
  if (time < timeToMinutes(7, 0)) {
    return { location: "home", activity: "sleeping" };
  }
  // 7:00-7:29 — playground (flag ceremony)
  if (time < timeToMinutes(7, 30)) {
    return { location: "playground", activity: "flag-ceremony" };
  }
  // 7:30-11:59 — office
  if (time < timeToMinutes(12, 0)) {
    return { location: "office", activity: "working" };
  }
  // 12:00-13:59 — home for lunch
  if (time < timeToMinutes(14, 0)) {
    return { location: "home", activity: "lunch" };
  }
  // 14:00-17:00 — office
  if (time <= timeToMinutes(17, 0)) {
    return { location: "office", activity: "working" };
  }
  // after 17:00 — home
  return { location: "home", activity: "resting" };
}

export function getScheduleEntry(
  npc: NPC,
  hour: number,
  minute: number,
  dayType: "weekday" | "weekend",
  season?: string,
): ScheduleEntry {
  // Weekend: everyone home
  if (dayType === "weekend") {
    return { location: "home", activity: "resting" };
  }

  const time = timeToMinutes(hour, minute);

  if (npc.role === "principal") {
    return getPrincipalSchedule(time);
  }

  return getStudentSchedule(time, season);
}
