import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, saveSession } from '../services/api';

function Register({ setUser }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const data = await api.register(form);
      saveSession(data);
      setUser(data.user);
      navigate('/list');
    } catch (err) {
      setError(err.message || 'Failed to register.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-container glass-card">
      <h1>Create Account</h1>
      <p className="muted-text">Register to save your tasks in SQLite.</p>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input name="name" type="text" placeholder="Your name" value={form.name} onChange={updateField} />

        <label>Email</label>
        <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={updateField} />

        <label>Password</label>
        <input name="password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={updateField} />

        <button className="btn btn-pink" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="muted-text">Already have an account? <Link to="/login">Login here</Link></p>
    </section>
  );
}

export default Register;
