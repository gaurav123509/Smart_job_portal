import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ currentUser, onLogout, compact = false }) {
  const navigate = useNavigate();

  const handleProtectedClick = (event, to) => {
    if (!currentUser) {
      event.preventDefault();
      navigate('/login');
      return;
    }

    navigate(to);
  };

  return (
    <nav className={compact ? 'subpage-header' : 'nav-bar'}>
      <Link to="/" className="brand">
        <span className="brand-mark">SJP</span>
        <span className="brand-text">Smart Job Portal</span>
      </Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/jobs">Jobs</Link>
        <Link to="/dashboard" onClick={(event) => handleProtectedClick(event, '/dashboard')}>Dashboard</Link>
        {currentUser ? (
          <button className="button-link ghost type-button" type="button" onClick={onLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Sign in</Link>
            <Link to="/register" className="button-link accent">Join now</Link>
          </>
        )}
      </div>
    </nav>
  );
}
