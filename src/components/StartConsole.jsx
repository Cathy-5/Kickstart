import TaskCartridge from "./TaskCartridge";

export default function StartConsole({ task, onStart, onOpen, onHide, durationMinutes, onDurationChange, disabled = false }) {
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
      {durationMinutes && onDurationChange && (
        <div className="duration-options" role="group" aria-label="Session length">
          <span className="duration-label">Session</span>
          {[5, 15, 25].map((minutes) => (
            <button
              className={`duration-option ${durationMinutes === minutes ? "selected" : ""}`}
              key={minutes}
              type="button"
              aria-pressed={durationMinutes === minutes}
              onClick={() => onDurationChange(minutes)}
            >
              {minutes}m
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
