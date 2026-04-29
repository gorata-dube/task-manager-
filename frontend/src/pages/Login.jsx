import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, saveSession } from '../services/api';

function Login({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const data = await api.login(form);
      saveSession(data);
      setUser(data.user);
      navigate('/list');
    } catch (err) {
      setError(err.message || 'Failed to login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-container glass-card">
      <h1>Login</h1>
      <p className="muted-text">Continue managing your tasks.</p>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={updateField} />

        <label>Password</label>
        <input name="password" type="password" placeholder="Your password" value={form.password} onChange={updateField} />

        <button className="btn btn-pink" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="muted-text">No account? <Link to="/register">Register here</Link></p>
    </section>
  );
}

export default Login;
