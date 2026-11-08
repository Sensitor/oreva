export interface TimedExercise {
  durationSec: number;
}

export interface SessionPosition {
  /** Index of the current exercise. */
  index: number;
  exerciseElapsed: number;
  exerciseRemaining: number;
  totalDuration: number;
  /** 0 to 1 over the whole session. */
  progress: number;
  finished: boolean;
}

/** Where a guided session is after `elapsed` seconds. Pure, so it is unit-tested. */
export function sessionPosition(exercises: TimedExercise[], elapsed: number): SessionPosition {
  const totalDuration = exercises.reduce((sum, e) => sum + e.durationSec, 0);
  const clamped = Math.min(Math.max(elapsed, 0), totalDuration);
  let start = 0;
  for (let index = 0; index < exercises.length; index += 1) {
    const duration = exercises[index]?.durationSec ?? 0;
    if (clamped < start + duration) {
      return {
        index,
        exerciseElapsed: clamped - start,
        exerciseRemaining: start + duration - clamped,
        totalDuration,
        progress: totalDuration === 0 ? 0 : clamped / totalDuration,
        finished: false,
      };
    }
    start += duration;
  }
  return {
    index: Math.max(exercises.length - 1, 0),
    exerciseElapsed: exercises[exercises.length - 1]?.durationSec ?? 0,
    exerciseRemaining: 0,
    totalDuration,
    progress: totalDuration === 0 ? 0 : 1,
    finished: true,
  };
}

/** Elapsed seconds at the start of exercise `index`. */
export function startOfExercise(exercises: TimedExercise[], index: number): number {
  return exercises.slice(0, Math.max(0, index)).reduce((sum, e) => sum + e.durationSec, 0);
}

/** 00:50 style timer. */
export function formatTimer(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
