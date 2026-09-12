import { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskCartridge from "./components/TaskCartridge";
import StartConsole from "./components/StartConsole";
import Timer from "./components/Timer";
import ReflectionForm from "./components/ReflectionForm.jsx";
import { loadTasks, saveTasks } from "./utils/taskStorage.js";
import { loadSessions, saveSessions } from "./utils/sessionStorage.js";
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
  const [activeTask, setActiveTask] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [sessions, setSessions] = useState(loadSessions);
  const [finishedSession, setFinishedSession] = useState(null);
  const [lastTaskId, setLastTaskId] = useState(() => localStorage.getItem("kickstart-last-task"));
  const [historyPage, setHistoryPage] = useState(0);
  const [taskPage, setTaskPage] = useState(0);

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
    selectTask(task);
    setActiveTask(task);
    setSessionStarted(true);
  }

  function goHome() {
    setActiveTask(null);
    setSessionStarted(false);
    setIsCreatingTask(false);
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

  function handleFinishSession(elapsedTime) {
    const session = {
      id: crypto.randomUUID(), taskId: activeTask.id, taskTitle: activeTask.title,
      elapsedTime, completedAt: new Date().toISOString(),
    };
    setSessions((currentSessions) => [...currentSessions, session]);
    setFinishedSession(session);
    setActiveTask(null);
    setSessionStarted(false);
    setHistoryPage(0);
  }

  function saveReflection(reflection) {
    setSessions((currentSessions) => currentSessions.map((session) => (
      session.id === finishedSession.id ? { ...session, reflection } : session
    )));
    setTasks((currentTasks) => currentTasks.map((task) => (
      task.id === finishedSession.taskId ? { ...task, completed: true } : task
    )));
    setFinishedSession(null);
  }

  return (
    <main className={`app ${showHome && sessions.length ? "with-history" : ""}`}>
      <header className="app-header"><h1>Kickstart<span aria-hidden="true">.</span></h1></header>

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
                onHide={featuredTask ? () => toggleTaskVisibility(featuredTask.id) : undefined} />
              <button className="text-button add-task-link" onClick={createTask}>+ Add task</button>
            </div>
          </div>
          <div className="cartridge-shelf">
            <div className="hidden-tags">
              {hiddenTasks.map((task) => (
                <button className="hidden-tag" key={task.id} data-tooltip={`Restore ${task.title}`}
                  aria-label={`Restore ${task.title}`} onClick={() => toggleTaskVisibility(task.id)}>
                  <span aria-hidden="true">+</span> {task.title}
                </button>
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
            {tasks.length > 0 && <button className="screen-back" onClick={goHome}>&larr; Cartridges</button>}
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
              </>
            )}
            <div className="screen-footer">{showTaskForm ? "ONE SMALL STEP IS ENOUGH." : "YOUR PROGRESS IS SAVED LOCALLY."}</div>
          </GameScreen>
          <div className="setup-console">
            <StartConsole task={showTaskForm ? null : activeTask} disabled={showTaskForm}
              onStart={() => startTask(activeTask)} />
          </div>
        </section>
      )}

      {activeTask && sessionStarted && (
        <section className="focus-scene">
          <GameScreen status="FOCUS">
            <h2 className="focus-task-title">{activeTask.title}</h2>
            <p className="focus-step">{activeTask.firstStep}</p>
            <Timer autoStart onFinish={handleFinishSession} />
          </GameScreen>
        </section>
      )}

      {finishedSession && (
        <section className="reflection-scene">
          <GameScreen status="SAVED">
            <h2>Session complete!</h2>
            <p className="session-summary">{finishedSession.taskTitle}</p>
            <ReflectionForm onSave={saveReflection} />
          </GameScreen>
        </section>
      )}

      {showHome && sessions.length > 0 && (
        <aside className="history-panel">
          <h2>Session history</h2>
          <ul>{visibleSessions.map((session) => (
            <li key={session.id}>
              <strong>{session.taskTitle}</strong>
              <span className="session-duration">{Math.round(session.elapsedTime / 1000)} sec</span>
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
    </main>
  );
}
