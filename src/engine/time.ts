export type Season = "spring" | "summer" | "autumn" | "winter";
export type Period = "morning" | "afternoon" | "evening" | "night";

export interface GameTime {
  date: string; // YYYY-MM-DD in game calendar
  hour: number;
  minute: number;
  season: Season;
  period: Period;
}

export interface TimeEngineConfig {
  calendarOffset: number;
  gameStartDate: string; // e.g. '1994-09-01'
  anchorRealDate: string; // ISO string, required to avoid flaky tests
}

const TICK_MINUTES = 15;
const COARSE_THRESHOLD_DAYS = 7;

export class TimeEngine {
  calendarOffset: number;
  private gameStartDate: string;
  private anchorRealDate: Date;

  constructor(config: TimeEngineConfig) {
    this.calendarOffset = config.calendarOffset;
    this.gameStartDate = config.gameStartDate;
    this.anchorRealDate = new Date(config.anchorRealDate);
  }

  /** Calculate game date from anchor + offset + elapsed real days */
  calculateGameDate(realNow: Date): string {
    const msPerDay = 86_400_000;
    const realDaysElapsed = Math.floor(
      (realNow.getTime() - this.anchorRealDate.getTime()) / msPerDay,
    );
    const totalGameDays = realDaysElapsed + this.calendarOffset;

    const start = new Date(this.gameStartDate + "T00:00:00Z");
    const gameDate = new Date(start.getTime() + totalGameDays * msPerDay);

    const y = gameDate.getUTCFullYear();
    const m = String(gameDate.getUTCMonth() + 1).padStart(2, "0");
    const d = String(gameDate.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  /** Get full game time for a given real-world instant */
  getGameTime(realNow: Date): GameTime {
    const date = this.calculateGameDate(realNow);
    const hour = realNow.getUTCHours();
    const minute = realNow.getUTCMinutes();
    const season = this.getSeason(date);
    const period = TimeEngine.getPeriod(hour);
    return { date, hour, minute, season, period };
  }

  /** Advance game calendar by n days, resetting anchor to now */
  skipDays(n: number): void {
    this.calendarOffset += n;
  }

  /**
   * Number of simulation ticks needed to catch up from lastVisit to now.
   * Normal mode: one tick per 15 real minutes.
   * Coarse mode (>7 days): one tick per real day.
   */
  getTickCount(lastVisit: Date, now: Date): number {
    const diffMs = now.getTime() - lastVisit.getTime();
    if (this.isCoarseMode(lastVisit, now)) {
      return Math.floor(diffMs / 86_400_000);
    }
    return Math.floor(diffMs / (TICK_MINUTES * 60_000));
  }

  /** True when the gap exceeds the coarse threshold */
  isCoarseMode(lastVisit: Date, now: Date): boolean {
    const diffMs = now.getTime() - lastVisit.getTime();
    return diffMs > COARSE_THRESHOLD_DAYS * 86_400_000;
  }

  /** Determine season from a YYYY-MM-DD game date string */
  getSeason(dateStr: string): Season {
    const month = parseInt(dateStr.split("-")[1], 10);
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
  }

  /** Determine time-of-day period from hour (0-23) */
  static getPeriod(hour: number): Period {
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }
}
