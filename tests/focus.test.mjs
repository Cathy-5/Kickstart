import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { elapsedAt, getJourney, formatFocusTime } from '../src/utils/focusProgress.js';
import { loadActiveSession, saveActiveSession, clearActiveSession } from '../src/utils/activeSessionStorage.js';
import { loadSessions, saveSessions } from '../src/utils/sessionStorage.js';

const task = { id: 'swedish', title: 'Study Swedish', firstStep: 'Read one page' };
const session = { id: 'session-1', task, durationMs: 300000, elapsedMs: 12340 };

beforeEach(() => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };
});

test('elapsed time follows the clock rather than counting interval callbacks', () => {
  assert.equal(elapsedAt({ elapsedMs: 5000, startedAt: 1000 }, 300000, 11000), 15000);
});

test('paused time never increases', () => {
  assert.equal(elapsedAt({ elapsedMs: 5000, startedAt: null }, 300000, 9999999), 5000);
});

test('a delayed tick cannot exceed the selected duration', () => {
  assert.equal(elapsedAt({ elapsedMs: 5000, startedAt: 1000 }, 300000, 9999999), 300000);
});

test('a backwards system clock cannot subtract earned focus', () => {
  assert.equal(elapsedAt({ elapsedMs: 5000, startedAt: 2000 }, 300000, 1000), 5000);
});

test('short sessions contribute proportionally to a 60-minute trail', () => {
  assert.equal(getJourney(300).progress, 1 / 12);
  assert.equal(getJourney(900).progress, 0.25);
  assert.equal(getJourney(1800).remainingMinutes, 30);
});

test('a completed trail stays at the camp until further focus starts the next trail', () => {
  assert.deepEqual(getJourney(3600), { completed: 1, stage: 1, progress: 1, remainingMinutes: 0 });
  assert.equal(getJourney(3601).stage, 2);
  assert.equal(getJourney(7200).completed, 2);
});

test('invalid journey inputs start at zero', () => {
  assert.equal(getJourney(-20).progress, 0);
  assert.equal(getJourney(NaN).progress, 0);
});

test('focus labels use seconds for short sessions, then minutes and hours', () => {
  assert.equal(formatFocusTime(12.9), '12s');
  assert.equal(formatFocusTime(900), '15m');
  assert.equal(formatFocusTime(3660), '1h 1m');
});

test('refresh restores task, duration, and exact checkpoint in a paused state', () => {
  assert.equal(saveActiveSession({ ...session, isRunning: true }), true);
  const restored = loadActiveSession();
  assert.equal(restored.elapsedMs, session.elapsedMs);
  assert.equal(restored.durationMs, session.durationMs);
  assert.deepEqual(restored.task, task);
  assert.equal(restored.isRunning, false);
  assert.equal(restored.restored, true);
});

test('completed sessions cannot be recovered and saved a second time', () => {
  saveActiveSession(session);
  assert.equal(loadActiveSession([{ id: session.id }]), null);
});

test('reset replaces the recovery checkpoint', () => {
  saveActiveSession(session);
  saveActiveSession({ ...session, elapsedMs: 0 });
  assert.equal(loadActiveSession().elapsedMs, 0);
});

test('clearing recovery leaves task data and history untouched', () => {
  localStorage.setItem('kickstart-tasks', 'original tasks');
  saveSessions([{ id: 'saved', elapsedTime: 15000 }]);
  saveActiveSession(session);
  clearActiveSession();
  assert.equal(loadActiveSession(), null);
  assert.equal(localStorage.getItem('kickstart-tasks'), 'original tasks');
  assert.equal(loadSessions().length, 1);
});

test('invalid or corrupt checkpoints fail safely', () => {
  for (const value of ['{', '{}', 'null', JSON.stringify({ ...session, durationMs: -1 }), JSON.stringify({ ...session, task: {} })]) {
    localStorage.setItem('kickstart-active-session', value);
    assert.equal(loadActiveSession(), null);
  }
});

test('history validation prevents invalid durations from poisoning journey totals', () => {
  localStorage.setItem('kickstart-sessions', JSON.stringify([null, { elapsedTime: -10 }, { elapsedTime: 5000 }]));
  assert.equal(loadSessions().length, 1);
  localStorage.setItem('kickstart-sessions', '{}');
  assert.deepEqual(loadSessions(), []);
});

test('unavailable browser storage returns a failure without crashing the timer', () => {
  globalThis.localStorage.setItem = () => { throw new Error('Quota exceeded'); };
  assert.equal(saveActiveSession(session), false);
  assert.equal(saveSessions([]), false);
});
