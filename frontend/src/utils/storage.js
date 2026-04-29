export function getTasks() {
  const tasks = localStorage.getItem("tasks");
  return tasks ? JSON.parse(tasks) : [];
}

export function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

export function addTask(title) {
  const tasks = getTasks();

  const newTask = {
    id: Date.now(),
    title: title,
    completed: false
  };

  const updatedTasks = [...tasks, newTask];
  saveTasks(updatedTasks);
}