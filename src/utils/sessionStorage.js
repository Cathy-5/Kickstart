const STORAGE_KEY = "kickstart-sessions";

export function loadSessions() {
  try {
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    const sessions = savedSessions ? JSON.parse(savedSessions) : [];
    return Array.isArray(sessions) ? sessions.filter((session) => session
      && Number.isFinite(session.elapsedTime) && session.elapsedTime >= 0) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return true;
  } catch {
    return false;
  }
}
