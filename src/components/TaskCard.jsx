export default function TaskCard({ task }) {
  return (
    <li className="task-card">
      <strong>{task.title}</strong>
      <p>{task.firstStep}</p>
    </li>
  );
}
