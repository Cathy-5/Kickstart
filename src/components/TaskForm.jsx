import { useState } from "react";

export default function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [firstStep, setFirstStep] = useState("");

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
    <form onSubmit={handleSubmit}>
      <label htmlFor="task-title">Title:</label>
      <textarea
        id="task-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <label htmlFor="task-first-step">First step:</label>
      <textarea
        id="task-first-step"
        value={firstStep}
        onChange={(event) => setFirstStep(event.target.value)}
        required
      />

      <button type="submit">Add task</button>
    </form>
  );
}
