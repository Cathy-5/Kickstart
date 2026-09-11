import { useEffect, useState } from "react";
import TaskCard from "./components/TaskCard";
import TaskForm from "./components/TaskForm";
import Timer from "./components/Timer";
import ReflectionForm  from "./components/ReflectionForm.jsx";
import { loadTasks, saveTasks } from "./utils/taskStorage.js";
import { loadSessions, saveSessions } from "./utils/sessionStorage.js";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [activeTask, setActiveTask] = useState(null)
  const [sessions, setSessions] = useState(loadSessions);
  const [finishedSession, setFinishedSession] = useState(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  function handleAddTask(newTask) {
    const taskWithId = {
      ...newTask,
      id: crypto.randomUUID(),
    };

    setTasks((currentTasks) => [...currentTasks, taskWithId]); // ... copy all items from old to new array
  }

  function handleStartTask(task) {
    setActiveTask(task);
  }

  function handleFinishSession(elapsedTime) {
    const session = {
      id: crypto.randomUUID(),
      taskId: activeTask.id,
      taskTitle: activeTask.title,
      elapsedTime,
      completedAt: new Date().toISOString(),
    };

    setSessions((currentSessions) => [...currentSessions, session]);
    setFinishedSession(session);
    setActiveTask(null);

  }

  return (
    <main className="app">
      <h1>My tasks:</h1>

      <ul className="task-list">
        {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onStart={handleStartTask} />
        ))}
      </ul>

      {activeTask && (
        <>
          <p>Active task: {activeTask.title}</p> 
          <Timer onFinish={handleFinishSession} /> 
        </>
      )}

      {finishedSession && (
        <ReflectionForm
          onSave={(reflection) => {
            setSessions((currentSessions) =>
              currentSessions.map((session) =>
                session.id === finishedSession.id
                  ? { ...session, reflection }
                  : session
              )
            );

            setFinishedSession(null);
          }}       
        />
      )}

      {sessions.length > 0 && (
        <section>
          <h2>Session history</h2>
          <ul>
            {sessions.map((session) => (
              <li key={session.id}>
                {session.taskTitle} - {Math.round(session.elapsedTime / 1000)} seconds

                {session.reflection && (
                <p>Reflection: {session.reflection}</p>

                )}
              </li>
            ))}
            
          </ul>
        </section>
      )}

      <TaskForm onAddTask={handleAddTask} />
    </main>
  );
}
