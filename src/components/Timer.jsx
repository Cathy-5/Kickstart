import { useState, useEffect, useEffectEvent, useRef } from "react";
import { elapsedAt } from "../utils/focusProgress.js";
import { saveActiveSession } from "../utils/activeSessionStorage.js";

export default function Timer({ session, onFinish, onTick, onRunningChange, children }) {
  const totalTime = session.durationMs;
  const [isRunning, setIsRunning] = useState(session.isRunning);
  const [remainingTime, setRemainingTime] = useState(totalTime - session.elapsedMs);
  const [showRestored, setShowRestored] = useState(Boolean(session.restored));
  const [storageError, setStorageError] = useState(false);
  const [initialClock] = useState(() => ({ elapsedMs: session.elapsedMs, startedAt: session.isRunning ? Date.now() : null }));
  const clock = useRef(initialClock);
  const finished = useRef(false);
  const lastSave = useRef(0);

  function publish(elapsedMs) {
    setRemainingTime(totalTime - elapsedMs);
    onTick(elapsedMs);
  }

  function checkpoint(elapsedMs) {
    setStorageError(!saveActiveSession({ ...session, elapsedMs }));
  }

  function finish(elapsedMs) {
    if (finished.current || elapsedMs <= 0) return;
    finished.current = true;
    clock.current = { elapsedMs, startedAt: null };
    setIsRunning(false);
    onRunningChange(false);
    publish(elapsedMs);
    onFinish(elapsedMs);
  }

  const tick = useEffectEvent(() => {
    const now = Date.now();
    const elapsedMs = elapsedAt(clock.current, totalTime, now);
    publish(elapsedMs);
    if (elapsedMs >= totalTime) {
      finish(totalTime);
    } else if (now - lastSave.current >= 1000) {
      checkpoint(elapsedMs);
      lastSave.current = now;
    }
  });

  useEffect(() => {
    if (!isRunning && session.elapsedMs < totalTime) return;
    const interval = setInterval(() => tick(), 100);
    return () => clearInterval(interval);
  }, [isRunning, session.elapsedMs, totalTime]);

  const saveBeforeLeaving = useEffectEvent(() => {
    if (!finished.current) saveActiveSession({ ...session, elapsedMs: elapsedAt(clock.current, totalTime) });
  });

  useEffect(() => {
    const save = () => saveBeforeLeaving();
    const onVisibilityChange = () => { if (document.hidden) save(); };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  function toggleRunning() {
    const now = Date.now();
    const elapsedMs = elapsedAt(clock.current, totalTime, now);
    if (elapsedMs >= totalTime) { finish(totalTime); return; }
    clock.current = { elapsedMs, startedAt: isRunning ? null : now };
    setIsRunning(!isRunning);
    onRunningChange(!isRunning);
    setShowRestored(false);
    publish(elapsedMs);
    checkpoint(elapsedMs);
  }

  function resetTimer() {
    if (!window.confirm("Restart this timer? Progress in this unfinished session will be reset.")) return;
    clock.current = { elapsedMs: 0, startedAt: null };
    setIsRunning(false);
    onRunningChange(false);
    setShowRestored(false);
    publish(0);
    checkpoint(0);
  }

  const seconds = Math.ceil(remainingTime / 1000);
  const timeLabel = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const litSegments = Math.ceil((remainingTime / totalTime) * 15);

  return (
    <section className="timer">
      <div className={`timer-frame ${remainingTime <= 60000 ? "low-time" : ""}`}>
        <div className="timer-frame-top">
          <span className="hourglass-mark" aria-hidden="true" />
          <span className="eyebrow">{isRunning ? "Focus time" : "Paused"}</span>
          <span className="timer-total">of {totalTime / 60000}:00</span>
        </div>
        <div className="timer-display" aria-label={`${timeLabel} remaining`}>{timeLabel}</div>
        <div className="timer-segments" aria-label={`${litSegments} of 15 time segments remaining`} role="img">
          {Array.from({ length: 15 }, (_, index) => (
            <span className={`timer-segment ${index < litSegments ? "lit" : ""}`} key={index} />
          ))}
        </div>
      </div>
      {children}
      {showRestored && <p className="timer-notice" role="status">Progress restored. Resume when you&apos;re ready.</p>}
      {storageError && <p className="timer-notice" role="alert">Your browser couldn&apos;t save progress. Keep this page open.</p>}
      <div className="timer-actions">
        <button className="menu-cursor" onClick={toggleRunning}>{isRunning ? "Pause" : "Resume"}</button>
        <button onClick={resetTimer}>Reset</button>
        <button disabled={remainingTime >= totalTime} onClick={() => finish(elapsedAt(clock.current, totalTime))}>Finish session</button>
      </div>
    </section>
  );
}
