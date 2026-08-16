import TaskCard from "./components/TaskCard";
import { taskList } from "./utils/TaskData.js";
import './App.css';

// Controls task list and sends each task to Taskcard
export default function App() {

  return (
    <>
    <h1>My tasks:</h1>
    <ul className='task-list'>
      {taskList.map((task) => (
        <TaskCard task={task}/>
      ))}
    </ul>
    </>
  );
}

