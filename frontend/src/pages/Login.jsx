import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
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
    <main className="auth-page">
      <Navbar currentUser={null} onLogout={() => {}} />
      <section className="auth-shell">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-logo">
            <span>sjp</span>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your Smart Job Portal account</p>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <span className="input-icon">@</span>
              <input type="email" required value={form.email} placeholder="you@example.com" onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <div className="auth-row">
              <label>Password</label>
              <button className="auth-link" type="button">Forgot password?</button>
            </div>
            <div className="input-with-icon">
              <span className="input-icon">*</span>
              <input type="password" required value={form.password} placeholder="••••••••" onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>

          <button type="submit" className="auth-btn">Sign In</button>
          <p className={`form-message ${error ? 'error' : 'success'}`}>{error || message}</p>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-grid">
            <button type="button" className="social-btn">Google</button>
            <button type="button" className="social-btn">GitHub</button>
          </div>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign up free</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
