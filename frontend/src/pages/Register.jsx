import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/api';

const USER_KEY = 'smartJobPortalUser';

export default function Register() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    skills: '',
    study: '',
    bio: '',
    avatar: null,
    resume: null
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      const data = await registerUser(formData);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setMessage('Registration successful. Redirecting to dashboard.');
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-panel intro-panel">
        <p className="eyebrow">Join The Network</p>
        <h1>Create a profile companies can actually evaluate.</h1>
        <p>Students can upload resumes and showcase skills. Companies can onboard quickly and start publishing roles immediately.</p>
        <Link to="/login" className="button-link ghost">Already registered?</Link>
      </section>

      <section className="auth-panel form-panel">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Create account</h2>
          <div className="form-group"><label>Full name</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label>Email address</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label>Password</label><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div className="form-group"><label>Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="student">Student</option><option value="company">Company</option></select></div>
          <div className="form-group"><label>Skills</label><input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
          <div className="form-group"><label>Study / Education</label><input type="text" value={form.study} onChange={(e) => setForm({ ...form, study: e.target.value })} /></div>
          <div className="form-group"><label>Bio</label><textarea rows="3" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}></textarea></div>
          <div className="form-group"><label>Profile image</label><input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setForm({ ...form, avatar: e.target.files?.[0] || null })} /></div>
          <div className="form-group"><label>Resume file</label><input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setForm({ ...form, resume: e.target.files?.[0] || null })} /></div>
          <button type="submit" className="primary-btn">Join now</button>
          <p className={`form-message ${error ? 'error' : 'success'}`}>{error || message}</p>
        </form>
      </section>
    </main>
  );
}
