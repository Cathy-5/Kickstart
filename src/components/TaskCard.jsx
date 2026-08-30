export default function TaskCard({ task, onStart }) {
  return (
    <li className="task-card">
      <strong>{task.title}</strong>
      <p>{task.firstStep}</p>

      <button onClick={() => onStart(task)}>Start Anyway</button>
    </li>
  );
}
