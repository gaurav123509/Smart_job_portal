import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p className="footer-brand">Smart Job Portal</p>
          <p className="footer-copy">
            A fresher-first hiring platform with structured discovery, verified applicants, and clean workflows.
          </p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login">Login</Link>
        </div>
      </div>
      <p className="footer-meta">© 2026 Smart Job Portal for Freshers</p>
    </footer>
  );
}
