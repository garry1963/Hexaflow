import { PlayerProfile } from '../types';

/**
 * Returns the local date string in YYYY-MM-DD format
 * using the client's local timezone.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate the number of calendar days between two YYYY-MM-DD dates.
 */
export function getDaysBetweenDates(dateStr1: string, dateStr2: string): number {
  try {
    const d1 = new Date(`${dateStr1}T00:00:00`);
    const d2 = new Date(`${dateStr2}T00:00:00`);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 999;
  }
}

export type DailyStatus = 'not_attempted' | 'completed' | 'failed';

/**
 * Retrieves the daily puzzle status for today's date.
 */
export function getTodayDailyStatus(profile: PlayerProfile, dateStr?: string): DailyStatus {
  const today = dateStr || getLocalDateString();
  const historyStatus = profile.dailyHistory?.[today];
  if (historyStatus === 'completed' || historyStatus === 'failed') {
    return historyStatus;
  }
  return 'not_attempted';
}

/**
 * Checks if the user is allowed to attempt today's daily puzzle.
 * Exactly one attempt is allowed per day.
 */
export function canAttemptDaily(profile: PlayerProfile, dateStr?: string): boolean {
  return getTodayDailyStatus(profile, dateStr) === 'not_attempted';
}

/**
 * Calculate the updated daily win streak upon a successful daily puzzle completion.
 * Increments streak if completed yesterday or if starting a new streak.
 */
export function calculateNextWinStreak(profile: PlayerProfile, todayStr: string): number {
  if (!profile.lastDailyDate) {
    return 1;
  }

  // If already marked today, preserve current streak
  if (profile.lastDailyDate === todayStr) {
    return Math.max(1, profile.dailyStreak);
  }

  const daysDiff = getDaysBetweenDates(profile.lastDailyDate, todayStr);
  const prevStatus = profile.dailyHistory?.[profile.lastDailyDate];

  // Consecutive day and previous was a win -> increment streak
  if (daysDiff === 1 && prevStatus === 'completed') {
    return (profile.dailyStreak || 0) + 1;
  }

  // Missed days or previous was failed -> reset to 1
  return 1;
}
