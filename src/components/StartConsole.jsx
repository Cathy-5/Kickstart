import TaskCartridge from "./TaskCartridge";

export default function StartConsole({ task, onStart, onOpen, onHide, disabled = false }) {
  return (
    <div className="start-console">
      {task && <TaskCartridge key={task.id} task={task} selected onSelect={onOpen} onHide={onHide} />}
      <button
        className="start-button"
        type="button"
        disabled={disabled}
        data-tooltip={disabled ? "Add a task first" : `Start ${task?.title || "this task"}`}
        onClick={onStart}
      >
        <span>Start</span>
        <span>Anyway</span>
      </button>
    </div>
  );
}
