import { useId, useState } from "react";

export default function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [firstStep, setFirstStep] = useState("");
  const formId = useId();

  function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanFirstStep = firstStep.trim();

    if (!cleanTitle || !cleanFirstStep) {
      return;
    }

    onAddTask({
      title: cleanTitle,
      firstStep: cleanFirstStep,
    });

    setTitle("");
    setFirstStep("");
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="game-field menu-cursor">
        <label htmlFor={`${formId}-title`}>01 / Title</label>
        <input
          id={`${formId}-title`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Study Swedish"
          required
        />
      </div>
      <div className="game-field menu-cursor">
        <label htmlFor={`${formId}-step`}>02 / First step</label>
        <textarea
          id={`${formId}-step`}
          value={firstStep}
          onChange={(event) => setFirstStep(event.target.value)}
          placeholder="Read one page"
          rows={2}
          required
        />
      </div>
      <button className="game-menu-button menu-cursor" type="submit">Add task</button>
    </form>
  );
}
