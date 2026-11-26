import type { Program, ProgramDay } from '@oreva/core';

export interface ProgramProgress {
  /** Days that hold a session (rest days excluded). */
  sessionDays: ProgramDay[];
  /** Numbers of the days counted as done. */
  doneDayNumbers: ReadonlySet<number>;
  doneDays: number;
  /** The first session day not finished yet; undefined once all are done. */
  nextDay: ProgramDay | undefined;
  /** 0 to 1. */
  value: number;
}

/**
 * Program progress from sessions finished on this phone only: never invented.
 * A program can repeat a session (Morning reset on day 1 and day 7): each
 * time it was finished counts for one day, in order, so finishing it once
 * does not complete both days. Pure, so it is unit-tested.
 */
export function programProgress(program: Program, completedIds: Iterable<string>): ProgramProgress {
  const remaining = new Map<string, number>();
  for (const id of completedIds) {
    remaining.set(id, (remaining.get(id) ?? 0) + 1);
  }
  const sessionDays = program.days.filter((day) => day.workoutId);
  const doneDayNumbers = new Set<number>();
  for (const day of sessionDays) {
    const left = day.workoutId ? (remaining.get(day.workoutId) ?? 0) : 0;
    if (day.workoutId && left > 0) {
      doneDayNumbers.add(day.day);
      remaining.set(day.workoutId, left - 1);
    }
  }
  return {
    sessionDays,
    doneDayNumbers,
    doneDays: doneDayNumbers.size,
    nextDay: sessionDays.find((day) => !doneDayNumbers.has(day.day)),
    value: sessionDays.length === 0 ? 0 : doneDayNumbers.size / sessionDays.length,
  };
}
