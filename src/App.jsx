import { useEffect, useState } from "react";
import TaskCard from "./components/TaskCard";
import TaskForm from "./components/TaskForm";
import { loadTasks, saveTasks } from "./utils/taskStorage.js";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  function handleAddTask(newTask) {
    const taskWithId = {
      ...newTask,
      id: crypto.randomUUID(),
    };

    setTasks((currentTasks) => [...currentTasks, taskWithId]); // ... copy all items from old to new array
  }

  return (
    <main className="app">
      <h1>My tasks:</h1>

      <ul className="task-list">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </ul>

      <TaskForm onAddTask={handleAddTask} />
    </main>
  );
}
