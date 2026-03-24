import type { NPC } from "../data/npcs";
import { getPostmanStop } from "../data/routes";

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
  // 12:00-13:29 — home for lunch (回家吃饭)
  if (time < timeToMinutes(13, 30)) {
    return { location: "home", activity: "lunch" };
  }
  // 13:30-13:59 — road back to school
  if (time < timeToMinutes(14, 0)) {
    return { location: "road", activity: "walking-to-school" };
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

function getTeacherColleagueSchedule(time: number): ScheduleEntry {
  // before 7:00 — home
  if (time < timeToMinutes(7, 0)) {
    return { location: "home", activity: "sleeping" };
  }
  // 7:00-7:29 — playground (flag ceremony)
  if (time < timeToMinutes(7, 30)) {
    return { location: "playground", activity: "flag-ceremony" };
  }
  // 7:30-9:44 — classroom (co-teaching)
  if (time < timeToMinutes(9, 45)) {
    return { location: "classroom", activity: "co-teaching" };
  }
  // 9:45-10:14 — office (break)
  if (time < timeToMinutes(10, 15)) {
    return { location: "office", activity: "break" };
  }
  // 10:15-11:59 — classroom (co-teaching)
  if (time < timeToMinutes(12, 0)) {
    return { location: "classroom", activity: "co-teaching" };
  }
  // 12:00-13:59 — home for lunch
  if (time < timeToMinutes(14, 0)) {
    return { location: "home", activity: "lunch" };
  }
  // 14:00-15:44 — classroom (co-teaching)
  if (time < timeToMinutes(15, 45)) {
    return { location: "classroom", activity: "co-teaching" };
  }
  // 15:45-16:14 — office (break)
  if (time < timeToMinutes(16, 15)) {
    return { location: "office", activity: "break" };
  }
  // 16:15-17:00 — classroom (co-teaching)
  if (time <= timeToMinutes(17, 0)) {
    return { location: "classroom", activity: "co-teaching" };
  }
  // after 17:00 — home
  return { location: "home", activity: "resting" };
}

const FARMING_MONTHS = [4, 5, 6, 9, 10];

function getParentSchedule(time: number, month?: number): ScheduleEntry {
  const isFarmingMonth = month != null && FARMING_MONTHS.includes(month);

  if (isFarmingMonth) {
    // Farming months: farmland during daytime, home rest
    if (time < timeToMinutes(6, 0)) {
      return { location: "home", activity: "sleeping" };
    }
    if (time < timeToMinutes(12, 0)) {
      return { location: "farmland", activity: "farming" };
    }
    if (time < timeToMinutes(14, 0)) {
      return { location: "home", activity: "lunch" };
    }
    if (time < timeToMinutes(18, 0)) {
      return { location: "farmland", activity: "farming" };
    }
    return { location: "home", activity: "resting" };
  }

  // Off-months: might visit school in afternoon
  if (time < timeToMinutes(7, 0)) {
    return { location: "home", activity: "sleeping" };
  }
  if (time < timeToMinutes(12, 0)) {
    return { location: "home", activity: "resting" };
  }
  if (time < timeToMinutes(14, 0)) {
    return { location: "home", activity: "lunch" };
  }
  // Afternoon: visit school
  if (time < timeToMinutes(16, 0)) {
    return { location: "classroom", activity: "visiting-school" };
  }
  return { location: "home", activity: "resting" };
}

function getVillagerSchedule(time: number): ScheduleEntry {
  if (time < timeToMinutes(6, 0)) {
    return { location: "villager-house", activity: "sleeping" };
  }
  if (time < timeToMinutes(12, 0)) {
    return { location: "farmland", activity: "farming" };
  }
  if (time < timeToMinutes(14, 0)) {
    return { location: "villager-house", activity: "lunch" };
  }
  if (time < timeToMinutes(18, 0)) {
    return { location: "farmland", activity: "farming" };
  }
  return { location: "villager-house", activity: "resting" };
}

function getShopkeeperSchedule(time: number): ScheduleEntry {
  if (time >= timeToMinutes(8, 0) && time < timeToMinutes(18, 0)) {
    return { location: "market", activity: "selling" };
  }
  return { location: "home", activity: "resting" };
}

function getPostmanSchedule(time: number, hour: number, minute: number): ScheduleEntry {
  // Before 7:30: home
  if (time < timeToMinutes(7, 30)) {
    return { location: "home", activity: "sleeping" };
  }
  // 7:30-8:00: post-office (picking up mail)
  if (time < timeToMinutes(8, 0)) {
    return { location: "post-office", activity: "picking-up-mail" };
  }
  // 8:00-17:00: follows route
  if (time <= timeToMinutes(17, 0)) {
    const stop = getPostmanStop(hour, minute);
    return { location: stop.locationId, activity: "delivering-mail" };
  }
  // After 17:00: home
  return { location: "home", activity: "resting" };
}

export function getScheduleEntry(
  npc: NPC,
  hour: number,
  minute: number,
  dayType: "weekday" | "weekend",
  season?: string,
  month?: number,
): ScheduleEntry {
  // Weekend: everyone home
  if (dayType === "weekend") {
    return { location: "home", activity: "resting" };
  }

  const time = timeToMinutes(hour, minute);

  switch (npc.role) {
    case "principal":
      return getPrincipalSchedule(time);
    case "teacher-colleague":
      return getTeacherColleagueSchedule(time);
    case "parent":
      return getParentSchedule(time, month);
    case "villager":
      return getVillagerSchedule(time);
    case "shopkeeper":
      return getShopkeeperSchedule(time);
    case "postman":
      return getPostmanSchedule(time, hour, minute);
    default:
      return getStudentSchedule(time, season);
  }
}
