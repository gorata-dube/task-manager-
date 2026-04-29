import { useEffect, useMemo, useState } from 'react';
import TaskCard from '../components/TaskCard';
import { api } from '../services/api';

function List() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return tasks;
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(keyword) ||
      String(task.description || '').toLowerCase().includes(keyword)
    );
  }, [tasks, search]);

  async function loadTasks() {
    try {
      setLoading(true);
      setError('');
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteTask(id) {
    try {
      await api.deleteTask(id);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete task.');
    }
  }

  async function toggleComplete(task) {
    try {
      const updatedTask = await api.updateTask(task.id, { completed: !task.completed });
      setTasks((currentTasks) => currentTasks.map((item) => (item.id === task.id ? updatedTask : item)));
    } catch (err) {
      setError(err.message || 'Failed to update task.');
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <section className="task-container glass-card wide-card">
      <div className="list-header">
        <div>
          <h1>Task List</h1>
          <p className="muted-text">View, search, complete and delete tasks saved in SQLite.</p>
        </div>
        <button className="btn btn-outline" onClick={loadTasks} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <input className="search-input" type="search" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {error && <p className="error-text">{error}</p>}

      {!loading && filteredTasks.length === 0 && (
        <p className="empty-text">No tasks yet. Add your first task.</p>
      )}

      <div className="tasks-grid">
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} deleteTask={deleteTask} toggleComplete={toggleComplete} />
        ))}
      </div>
    </section>
  );
}

export default List;
