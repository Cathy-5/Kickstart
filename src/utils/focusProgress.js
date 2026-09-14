export const JOURNEY_SECONDS = 60 * 60;

export function elapsedAt(clock, durationMs, now = Date.now()) {
  const runningTime = clock.startedAt === null ? 0 : Math.max(0, now - clock.startedAt);
  return Math.min(durationMs, Math.max(0, clock.elapsedMs + runningTime));
}

export function getJourney(totalSeconds) {
  const seconds = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const completed = Math.floor(seconds / JOURNEY_SECONDS);
  const remainder = seconds % JOURNEY_SECONDS;
  // Stay at the flag on an exact finish, until the next bit of focus is earned.
  const atFinish = seconds > 0 && remainder === 0;
  return {
    completed,
    stage: atFinish ? completed : completed + 1,
    progress: atFinish ? 1 : remainder / JOURNEY_SECONDS,
    remainingMinutes: atFinish ? 0 : Math.ceil((JOURNEY_SECONDS - remainder) / 60),
  };
}

export function formatFocusTime(totalSeconds) {
  const seconds = Math.floor(Math.max(0, totalSeconds));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
