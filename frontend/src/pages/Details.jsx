import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';

function Details() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTask() {
      try {
        setLoading(true);
        setError('');
        const data = await api.getTask(id);
        setTask(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          due_date: data.due_date || '',
          priority: data.priority || 'Normal',
          completed: Boolean(data.completed)
        });
      } catch (err) {
        setError(err.message || 'Failed to load task details.');
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [id]);

  function updateField(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title.trim()) {
      setError('Task title cannot be empty.');
      return;
    }

    try {
      const updatedTask = await api.updateTask(id, form);
      setTask(updatedTask);
      setForm({
        title: updatedTask.title || '',
        description: updatedTask.description || '',
        due_date: updatedTask.due_date || '',
        priority: updatedTask.priority || 'Normal',
        completed: Boolean(updatedTask.completed)
      });
      setSuccess('Task updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update task.');
    }
  }

  if (loading) return <section className="details-card glass-card">Loading task...</section>;

  if (error && !task) {
    return (
      <section className="details-card glass-card">
        <h1>Task Details</h1>
        <p className="error-text">{error}</p>
        <Link to="/list" className="btn btn-outline">Back to Tasks</Link>
      </section>
    );
  }

  return (
    <section className="details-card glass-card">
      <h1>Task Details</h1>
      <p className="muted-text">View and edit the full task information.</p>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <form onSubmit={handleUpdate}>
        <label>Task title</label>
        <input name="title" value={form.title} onChange={updateField} />

        <label>Description</label>
        <textarea name="description" value={form.description} onChange={updateField} />

        <label>Due date</label>
        <input name="due_date" type="date" value={form.due_date} onChange={updateField} />

        <label>Priority</label>
        <select name="priority" value={form.priority} onChange={updateField}>
          <option>Low</option>
          <option>Normal</option>
          <option>High</option>
        </select>

        <label className="checkbox-row">
          <input name="completed" type="checkbox" checked={form.completed} onChange={updateField} />
          Mark as complete
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-pink">Save Changes</button>
          <Link to="/list" className="btn btn-outline">Back to Tasks</Link>
        </div>
      </form>
    </section>
  );
}

export default Details;
