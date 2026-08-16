export default function TaskCard({ task }) {
  return (
    <li key={task.id}>
      <strong>{task.title}</strong>
      <p>{task.firstStep}</p>
    </li>
  );
}