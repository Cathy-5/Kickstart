import { taskList } from "./taskData.js";

const STORAGE_KEY = "kickstart-tasks";

export function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    return savedTasks ? JSON.parse(savedTasks) : taskList;
  } catch {
    return taskList;
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
