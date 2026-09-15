import { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskCartridge from "./components/TaskCartridge";
import StartConsole from "./components/StartConsole";
import MomentumRunner from "./components/MomentumRunner";
import Timer from "./components/Timer";
import ReflectionForm from "./components/ReflectionForm.jsx";
import MilestoneDialog from "./components/MilestoneDialog.jsx";
import { loadTasks, saveTasks } from "./utils/taskStorage.js";
import { loadSessions, saveSessions } from "./utils/sessionStorage.js";
import { loadActiveSession, saveActiveSession, clearActiveSession } from "./utils/activeSessionStorage.js";
import { formatFocusTime, getJourney } from "./utils/focusProgress.js";
import { getMilestone, primeMilestoneAudio } from "./utils/milestones.js";
import "./App.css";

function GameScreen({ status, children }) {
  return (
    <div className="screen-bezel">
      <div className="game-screen">
        <div className="screen-status"><span>Kickstart</span><span>{status}</span></div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [focusSession, setFocusSession] = useState(() => loadActiveSession(loadSessions()));
  const [activeTask, setActiveTask] = useState(focusSession?.task || null);
  const [sessionStarted, setSessionStarted] = useState(Boolean(focusSession));
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [sessions, setSessions] = useState(loadSessions);
  const [finishedSession, setFinishedSession] = useState(null);
  const [lastTaskId, setLastTaskId] = useState(() => localStorage.getItem("kickstart-last-task"));
  const [historyPage, setHistoryPage] = useState(0);
  const [taskPage, setTaskPage] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(focusSession ? focusSession.durationMs / 60000 : 15);
  const [liveElapsedTime, setLiveElapsedTime] = useState(focusSession?.elapsedMs || 0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [historySaveFailed, setHistorySaveFailed] = useState(false);
  const [milestone, setMilestone] = useState(null);

  const visibleTasks = tasks.filter((task) => !task.hidden);
  const hiddenTasks = tasks.filter((task) => task.hidden);
  const featuredTask = visibleTasks.find((task) => String(task.id) === lastTaskId)
    || visibleTasks.find((task) => !task.completed) || visibleTasks[0];
  const orbitTasks = visibleTasks.filter((task) => task.id !== featuredTask?.id);
  const taskPageCount = Math.max(1, Math.ceil(orbitTasks.length / 4));
  const currentTaskPage = Math.min(taskPage, taskPageCount - 1);
  const displayedTasks = orbitTasks.slice(currentTaskPage * 4, currentTaskPage * 4 + 4);
  const visibleSessions = [...sessions].reverse().slice(historyPage * 5, historyPage * 5 + 5);
  const hasNextHistoryPage = (historyPage + 1) * 5 < sessions.length;
  const showTaskForm = isCreatingTask || (tasks.length === 0 && !activeTask && !finishedSession);
  const showHome = !activeTask && !showTaskForm && !finishedSession;
  const savedFocusSeconds = sessions.reduce((total, session) => total + session.elapsedTime / 1000, 0);
  const runnerSeconds = savedFocusSeconds + (activeTask && sessionStarted ? liveElapsedTime / 1000 : 0);

  useEffect(() => { saveTasks(tasks); }, [tasks]);
  useEffect(() => { saveSessions(sessions); }, [sessions]);

  function selectTask(task) {
    setLastTaskId(String(task.id));
    localStorage.setItem("kickstart-last-task", String(task.id));
  }

  function handleAddTask(newTask) {
    const taskWithId = { ...newTask, id: crypto.randomUUID() };
    setTasks((currentTasks) => [...currentTasks, taskWithId]);
    selectTask(taskWithId);
    setActiveTask(taskWithId);
    setSessionStarted(false);
    setIsCreatingTask(false);
  }

  function openTask(task) {
    selectTask(task);
    setActiveTask(task);
    setSessionStarted(false);
  }

  function startTask(task) {
    primeMilestoneAudio();
    const nextSession = {
      id: crypto.randomUUID(), task, durationMs: sessionDuration * 60000,
      elapsedMs: 0, isRunning: true,
    };
    setFocusSession(nextSession);
    saveActiveSession(nextSession);
    selectTask(task);
    setActiveTask(task);
    setSessionStarted(true);
    setLiveElapsedTime(0);
    setIsTimerRunning(true);
  }

  function goHome() {
    setActiveTask(null);
    setSessionStarted(false);
    setIsCreatingTask(false);
    setIsTimerRunning(false);
  }

  function createTask() {
    setActiveTask(null);
    setIsCreatingTask(true);
  }

  function toggleTaskVisibility(taskId) {
    setTasks((currentTasks) => currentTasks.map((task) => (
      task.id === taskId ? { ...task, hidden: !task.hidden } : task
    )));
  }

  function handleFinishSession(elapsedTime, completedNormally = false) {
    if (!focusSession) return;
    const beforeSeconds = sessions.reduce((total, savedSession) => total + savedSession.elapsedTime / 1000, 0);
    const session = {
      id: focusSession.id, taskId: activeTask.id, taskTitle: activeTask.title,
      elapsedTime, completedAt: new Date().toISOString(),
    };
    const nextSessions = sessions.some((saved) => saved.id === session.id) ? sessions : [...sessions, session];
    // Commit history before clearing the checkpoint, so recovery cannot duplicate it.
    const saved = saveSessions(nextSessions);
    setHistorySaveFailed(!saved);
    if (saved) clearActiveSession();
    else saveActiveSession({ ...focusSession, elapsedMs: elapsedTime });
    setSessions(nextSessions);
    setFocusSession(null);
    setFinishedSession(session);
    setActiveTask(null);
    setSessionStarted(false);
    setLiveElapsedTime(0);
    setIsTimerRunning(false);
    setHistoryPage(0);
    if (completedNormally) {
      setMilestone(getMilestone(
        beforeSeconds,
        beforeSeconds + elapsedTime / 1000,
        Math.round(focusSession.durationMs / 60000),
      ));
    }
  }

  function saveReflection(reflection) {
    setSessions((currentSessions) => currentSessions.map((session) => (
      session.id === finishedSession.id ? { ...session, reflection } : session
    )));
    setFinishedSession(null);
  }

  function toggleTaskCompleted(taskId) {
    const completed = !tasks.find((task) => task.id === taskId)?.completed;
    setTasks((currentTasks) => currentTasks.map((task) => (
      task.id === taskId ? { ...task, completed } : task
    )));
    setActiveTask((task) => task?.id === taskId ? { ...task, completed } : task);
  }

  function handleDeleteSession(sessionId) {
    if (!window.confirm("Delete this session from history?")) return;

    setSessions((currentSessions) => currentSessions.filter((session) => session.id !== sessionId));
    setHistoryPage((page) => Math.min(page, Math.max(0, Math.ceil((sessions.length - 1) / 5) - 1)));
  }

  function handleClearHistory() {
    if (!window.confirm("Clear all session history? Your tasks will stay saved.")) return;

    setSessions([]);
    setHistoryPage(0);
  }

  function handleDeleteTask(taskId) {
    const task = tasks.find((currentTask) => currentTask.id === taskId);
    if (!task || !window.confirm(`Delete "${task.title}" permanently?`)) return;

    setTasks((currentTasks) => currentTasks.filter((currentTask) => currentTask.id !== taskId));
    if (String(taskId) === lastTaskId) {
      setLastTaskId(null);
      localStorage.removeItem("kickstart-last-task");
    }
  }

  return (
    <main className={`app ${showHome && sessions.length ? "with-history" : ""}`}>
      <header className="app-header"><h1>Kickstart<span aria-hidden="true">.</span></h1></header>
      {historySaveFailed && <p className="storage-notice" role="alert">Your browser couldn&apos;t save this session. Keep this page open to retain it.</p>}

      {showHome && (
        <section className="home-orbit" aria-label="Choose a task cartridge">
          <div className="orbit-stage">
            {displayedTasks.map((task, index) => (
              <div className={`orbit-task orbit-task-${index}`} key={task.id}>
                <TaskCartridge task={task} tone={tasks.indexOf(task)}
                  onSelect={() => selectTask(task)} onHide={() => toggleTaskVisibility(task.id)} />
              </div>
            ))}
            <div className="orbit-center">
              <StartConsole task={featuredTask} disabled={!featuredTask}
                onStart={() => startTask(featuredTask)} onOpen={() => openTask(featuredTask)}
                onHide={featuredTask ? () => toggleTaskVisibility(featuredTask.id) : undefined}
                durationMinutes={sessionDuration} onDurationChange={setSessionDuration} />
              <button className="text-button add-task-link" onClick={createTask}>+ Add task</button>
            </div>
          </div>
          <MomentumRunner totalSeconds={runnerSeconds} className="home-runner" />
          <div className="cartridge-shelf">
            <div className="hidden-tags">
              {hiddenTasks.map((task) => (
                <div className="hidden-task" key={task.id}>
                  <button className="hidden-tag" data-tooltip={`Restore ${task.title}`}
                    aria-label={`Restore ${task.title}`} onClick={() => toggleTaskVisibility(task.id)}>
                    <span aria-hidden="true">+</span> {task.title}
                  </button>
                  <button className="hidden-task-delete" aria-label={`Delete ${task.title} permanently`}
                    onClick={() => handleDeleteTask(task.id)}>&times;</button>
                </div>
              ))}
            </div>
            {taskPageCount > 1 && (
              <nav className="page-nav" aria-label="Task cartridges">
                <button disabled={currentTaskPage === 0} aria-label="Previous cartridges" onClick={() => setTaskPage(currentTaskPage - 1)}>&larr;</button>
                <span>{currentTaskPage + 1}/{taskPageCount}</span>
                <button disabled={currentTaskPage + 1 === taskPageCount} aria-label="Next cartridges" onClick={() => setTaskPage(currentTaskPage + 1)}>&rarr;</button>
              </nav>
            )}
          </div>
        </section>
      )}

      {(showTaskForm || (activeTask && !sessionStarted)) && (
        <section className="setup-scene">
          <GameScreen status={showTaskForm ? "NEW" : "READY"}>
            {tasks.length > 0 && (
              <button className="screen-back" type="button" onClick={goHome}>
                <span className="screen-back-arrow" aria-hidden="true">&larr;</span>
                Back to cartridges
              </button>
            )}
            <h2>{showTaskForm ? "New task" : "Ready to play?"}</h2>
            {showTaskForm ? <TaskForm onAddTask={handleAddTask} /> : (
              <>
                <div className="game-field ready-field menu-cursor" tabIndex={0}>
                  <span className="field-label">01 / Title</span>
                  <p>{activeTask.title}</p>
                </div>
                <div className="game-field ready-field menu-cursor" tabIndex={0}>
                  <span className="field-label">02 / First step</span>
                  <p>{activeTask.firstStep}</p>
                </div>
                <button className="game-menu-button menu-cursor" onClick={createTask}>+ Add another task</button>
                <button className="game-menu-button menu-cursor" onClick={() => toggleTaskCompleted(activeTask.id)}>
                  {tasks.find((task) => task.id === activeTask.id)?.completed ? "Mark task as not completed" : "Mark task complete"}
                </button>
              </>
            )}
            <div className="screen-footer">{showTaskForm ? "ONE SMALL STEP IS ENOUGH." : "YOUR PROGRESS IS SAVED LOCALLY."}</div>
          </GameScreen>
          <div className="setup-console">
            <StartConsole task={showTaskForm ? null : activeTask} disabled={showTaskForm}
              onStart={() => startTask(activeTask)}
              durationMinutes={showTaskForm ? undefined : sessionDuration}
              onDurationChange={showTaskForm ? undefined : setSessionDuration} />
          </div>
        </section>
      )}

      {activeTask && sessionStarted && (
        <section className="focus-scene">
          <GameScreen status={isTimerRunning ? "FOCUS" : "PAUSED"}>
            <h2 className="focus-task-title">{activeTask.title}</h2>
            <p className="focus-step">{activeTask.firstStep}</p>
            <Timer key={focusSession.id} session={focusSession} onFinish={handleFinishSession}
              onTick={setLiveElapsedTime} onRunningChange={setIsTimerRunning}>
              <MomentumRunner totalSeconds={runnerSeconds} isRunning={isTimerRunning} />
            </Timer>
          </GameScreen>
        </section>
      )}

      {finishedSession && (
        <section className="reflection-scene">
          <GameScreen status="SAVED">
            <h2>Session saved!</h2>
            <p className="session-summary">{finishedSession.taskTitle}</p>
            <MomentumRunner totalSeconds={runnerSeconds} celebrate />
            <p className="session-earned" role="status">
              +{formatFocusTime(finishedSession.elapsedTime / 1000)} on your trail.
              {getJourney(runnerSeconds).completed > getJourney(runnerSeconds - finishedSession.elapsedTime / 1000).completed
                ? " Camp reached!" : " A little further than before."}
            </p>
            <div className="task-completion">
              <label>
                <input type="checkbox"
                  checked={Boolean(tasks.find((task) => task.id === finishedSession.taskId)?.completed)}
                  aria-describedby="task-completion-hint"
                  onChange={() => toggleTaskCompleted(finishedSession.taskId)} />
                <span>Mark task as completed</span>
              </label>
              <p id="task-completion-hint">Leave unchecked if you&apos;ll work on this task again.</p>
            </div>
            <ReflectionForm onSave={saveReflection} onSkip={() => setFinishedSession(null)} />
          </GameScreen>
        </section>
      )}

      {showHome && sessions.length > 0 && (
        <aside className="history-panel">
          <div className="history-heading">
            <h2>Session history</h2>
            <button className="clear-history" onClick={handleClearHistory}>Clear all</button>
          </div>
          <ul>{visibleSessions.map((session) => (
            <li key={session.id}>
              <div className="session-line">
                <strong>{session.taskTitle}</strong>
                <span className="session-duration">{formatFocusTime(session.elapsedTime / 1000)}</span>
                <button className="delete-session" aria-label={`Delete session for ${session.taskTitle}`} onClick={() => handleDeleteSession(session.id)}>&times;</button>
              </div>
              {session.reflection && <p>{session.reflection}</p>}
            </li>
          ))}</ul>
          {(historyPage > 0 || hasNextHistoryPage) && <nav className="page-nav" aria-label="Session history pages">
            <button disabled={historyPage === 0} aria-label="Newer sessions" onClick={() => setHistoryPage((page) => page - 1)}>&larr;</button>
            <span>{historyPage + 1}</span>
            <button disabled={!hasNextHistoryPage} aria-label="Older sessions" onClick={() => setHistoryPage((page) => page + 1)}>&rarr;</button>
          </nav>}
        </aside>
      )}

      {milestone && <MilestoneDialog milestone={milestone} onDismiss={() => setMilestone(null)} />}
    </main>
  );
}
