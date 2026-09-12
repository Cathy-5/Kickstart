export default function TaskCartridge({ task, selected = false, onSelect, onHide, tone = 0 }) {
  const Shell = onSelect ? "button" : "div";
  return (
    <div className={`cartridge-wrap ${selected ? "cartridge-inserted" : ""}`}>
      <Shell
        className={`cartridge cartridge-tone-${tone % 4}`}
        type={onSelect ? "button" : undefined}
        role={onSelect ? undefined : "img"}
        aria-label={selected ? `Current task: ${task.title}${onSelect ? ". View task" : ""}` : `Select ${task.title}`}
        aria-pressed={onSelect ? selected : undefined}
        data-tooltip={selected ? `Current task: ${task.title}` : `Select ${task.title}`}
        onClick={onSelect}
      >
        <span className="cartridge-grip" aria-hidden="true" />
        <span className="cartridge-label">
          <span className="cartridge-title">{task.title}</span>
          <span className="cartridge-marker" aria-hidden="true">{task.completed ? "DONE" : ""}</span>
        </span>
        <span className="cartridge-contacts" aria-hidden="true" />
      </Shell>
      {onHide && (
        <button className="tag-action" type="button" aria-label={`Hide ${task.title}`} onClick={onHide}>
          &times;
        </button>
      )}
    </div>
  );
}
