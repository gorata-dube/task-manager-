import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function AddTask() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Normal'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Please enter a task title.');
      return;
    }

    try {
      setLoading(true);
      const task = await api.createTask(form);
      navigate(`/details/${task.id}`);
    } catch (err) {
      setError(err.message || 'Failed to add task.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-container glass-card">
      <h1>Add Task</h1>
      <p className="muted-text">Use the form below to create a new task.</p>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Task title</label>
        <input name="title" type="text" placeholder="Example: Finish backend project" value={form.title} onChange={updateField} />

        <label>Description</label>
        <textarea name="description" placeholder="Add task details" value={form.description} onChange={updateField} />

        <label>Due date</label>
        <input name="due_date" type="date" value={form.due_date} onChange={updateField} />

        <label>Priority</label>
        <select name="priority" value={form.priority} onChange={updateField}>
          <option>Low</option>
          <option>Normal</option>
          <option>High</option>
        </select>

        <button className="btn btn-pink" type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </form>
    </section>
  );
}

export default AddTask;
