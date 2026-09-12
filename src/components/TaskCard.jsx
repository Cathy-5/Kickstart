export default function TaskCard({ task, onStart }) {
  return (
    <li className={`task-card ${task.completed ? "completed" : ""}`}>
      <strong>{task.title}</strong>
      {task.completed && <span>Completed</span>}
      <p>{task.firstStep}</p>

      <button className="start-button" data-tooltip="Start this task" onClick={() => onStart(task)}><span className="play-mark">▶</span>Start Anyway</button>
    </li>
  );
}
