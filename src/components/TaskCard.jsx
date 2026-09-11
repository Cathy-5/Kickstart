export default function TaskCard({ task, onStart }) {
  return (
    <li className={`task-card ${task.completed ? "completed" : ""}`}>
      <strong>{task.title}</strong>
      {task.completed && <span>Completed</span>}
      <p>{task.firstStep}</p>

      <button onClick={() => onStart(task)}>Start Anyway</button>
    </li>
  );
}
