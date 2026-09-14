const STORAGE_KEY = "kickstart-active-session";

export function loadActiveSession(savedSessions = []) {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!session || typeof session.id !== "string" || !session.task
      || session.task.id == null || typeof session.task.title !== "string"
      || (session.task.firstStep != null && typeof session.task.firstStep !== "string")
      || !Number.isFinite(session.durationMs) || session.durationMs <= 0
      || !Number.isFinite(session.elapsedMs) || session.elapsedMs < 0
      || savedSessions.some((saved) => saved.id === session.id)) return null;

    // Restore a checkpoint, not time spent away from the app.
    return { ...session, elapsedMs: Math.min(session.elapsedMs, session.durationMs), isRunning: false, restored: true };
  } catch {
    return null;
  }
}

export function saveActiveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      id: session.id, task: session.task,
      durationMs: session.durationMs, elapsedMs: session.elapsedMs,
    }));
    return true;
  } catch {
    return false;
  }
}

export function clearActiveSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
