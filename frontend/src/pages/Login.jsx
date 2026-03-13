import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/api';

const USER_KEY = 'smartJobPortalUser';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const data = await loginUser(form);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setMessage('Login successful. Redirecting to dashboard.');
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-panel intro-panel">
        <p className="eyebrow">Welcome Back</p>
        <h1>Stay close to your hiring pipeline.</h1>
        <p>Students can manage applications and companies can review applicants, posted roles, and hiring activity from one account.</p>
        <Link to="/register" className="button-link ghost">Create account</Link>
      </section>

      <section className="auth-panel form-panel">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <div className="form-group">
            <label>Email address</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" className="primary-btn">Login</button>
          <p className={`form-message ${error ? 'error' : 'success'}`}>{error || message}</p>
        </form>
      </section>
    </main>
  );
}
