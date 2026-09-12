import { taskList } from "./taskData.js";

const STORAGE_KEY = "kickstart-tasks";

export function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    const tasks = savedTasks ? JSON.parse(savedTasks) : taskList;
    return tasks.filter((task) => task.title.toLowerCase() !== "go to bed");
  } catch {
    return taskList.filter((task) => task.title.toLowerCase() !== "go to bed");
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
