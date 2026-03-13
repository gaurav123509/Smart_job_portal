import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CURRENT_USER_KEY = 'smartJobPortalUser';

const featureGroups = [
  {
    id: 'profile',
    label: 'Create Profile',
    options: [
      { label: 'Register account', to: '/register', requiresAuth: false },
      { label: 'Edit profile', to: '/dashboard', requiresAuth: true }
    ]
  },
  {
    id: 'apply',
    label: 'Apply for Jobs',
    options: [
      { label: 'Browse roles', to: '/jobs', requiresAuth: true },
      { label: "Track my apply's", to: '/dashboard', requiresAuth: true }
    ]
  },
  {
    id: 'dashboard',
    label: 'Open Dashboard',
    options: [
      { label: 'Student dashboard', to: '/dashboard', requiresAuth: true },
      { label: 'Profile activity', to: '/dashboard', requiresAuth: true }
    ]
  },
  {
    id: 'company',
    label: 'Company Login',
    options: [
      { label: 'Sign in', to: '/login', requiresAuth: false },
      { label: 'Hiring workspace', to: '/dashboard', requiresAuth: true }
    ]
  }
];

const getCurrentUser = () => {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export default function Home() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [typedTitle, setTypedTitle] = useState('');
  const [actionsOpen, setActionsOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState('');
  const title = 'Build your first role with a job portal that feels career-first.';

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTypedTitle(title);
      return undefined;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedTitle(title.slice(0, index));
      if (index >= title.length) {
        window.clearInterval(timer);
      }
    }, 32);

    return () => window.clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
    navigate('/login');
  };

  const handleActionClick = (event, option) => {
    if (option.requiresAuth && !currentUser) {
      event.preventDefault();
      navigate('/login');
    }
  };

  return (
    <>
      <header className="hero-shell">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />

        <section className="hero-grid hero-grid-pro">
          <div className="hero-copy-column">
            <p className="eyebrow">Career Network For Freshers</p>
            <h1 className={typedTitle.length < title.length ? 'typing-active' : ''}>{typedTitle || title}</h1>
            <p className="hero-copy">
              Smart Job Portal helps students discover entry-level openings, internships, and category-based roles while companies hire fresh talent through a clean recruiting workflow.
            </p>

            <div className="hero-search-shell">
              <div className="hero-search-card">
                <div className="hero-search-field">
                  <span className="hero-search-label">Job title</span>
                  <strong>Frontend Intern, Python Developer</strong>
                </div>
                <div className="hero-search-field">
                  <span className="hero-search-label">Location</span>
                  <strong>Remote, Pune, Bangalore</strong>
                </div>
                <Link to="/jobs" className="button-link accent">Find Jobs</Link>
              </div>
              <p className="hero-search-note">Popular: Fresher Jobs, Internship Jobs, Python Developer, Full Stack, UI/UX</p>
            </div>

            <div className="hero-actions">
              <Link to="/register" className="button-link accent">Create profile</Link>
              <Link to="/jobs" className="button-link ghost">Browse opportunities</Link>
            </div>

            <div className="hero-metrics">
              <article className="hero-metric reveal-card revealed">
                <strong>109+</strong>
                <span>Live roles seeded across fresher and internship categories</span>
              </article>
              <article className="hero-metric reveal-card revealed">
                <strong>Student Ready</strong>
                <span>Profile, resume, study, bio and applications in one flow</span>
              </article>
              <article className="hero-metric reveal-card revealed">
                <strong>Company Desk</strong>
                <span>Post openings and review fresh applicants from one dashboard</span>
              </article>
            </div>
          </div>

          <aside className="hero-preview-stack">
            <article className="hero-card float-card home-preview-card">
              <div className="preview-topbar">
                <span className="preview-pill active">Home</span>
                <span className="preview-pill">Find Jobs</span>
                <span className="preview-pill">Dashboard</span>
              </div>
              <div className="preview-main">
                <div className="preview-copy">
                  <p className="section-kicker">Freshers First</p>
                  <h2>Find a job that suits your interest &amp; skills.</h2>
                  <p>Start with internships, fresher openings, and category-driven search without jumping between platforms.</p>
                </div>
                <div className="preview-visual">
                  <div className="preview-orbit orbit-one"></div>
                  <div className="preview-orbit orbit-two"></div>
                  <div className="preview-avatar">fj</div>
                </div>
              </div>
              <div className="preview-stats">
                <div className="preview-stat"><strong>1,756</strong><span>Student profiles</span></div>
                <div className="preview-stat"><strong>97</strong><span>Hiring teams</span></div>
                <div className="preview-stat"><strong>7,532</strong><span>New jobs</span></div>
              </div>
            </article>

            <article className="hero-card float-card home-workspace-card">
              <div className="workspace-card-head">
                <p className="section-kicker">Workspace Map</p>
                <h2>What you can do here</h2>
                <p className="workspace-card-copy">Use one home panel to move from profile setup to job applications and hiring workflow.</p>
              </div>
              <div className="workspace-summary">
                <div className="workspace-summary-item"><span className="workspace-summary-label">For students</span><strong>Register, build profile, apply, track status</strong></div>
                <div className="workspace-summary-item"><span className="workspace-summary-label">For companies</span><strong>Login, publish jobs, review applicants</strong></div>
              </div>
              <button
                className={`feature-panel-toggle type-button ${actionsOpen ? 'is-open' : ''}`}
                type="button"
                onClick={() => setActionsOpen((value) => !value)}
              >
                Open quick actions
              </button>
              {actionsOpen && (
                <div className="feature-actions">
                  {featureGroups.map((group) => (
                    <div key={group.id} className={`feature-group ${activeFeature === group.id ? 'is-open' : ''}`}>
                      <button className="feature-button type-button" type="button" onClick={() => setActiveFeature((value) => value === group.id ? '' : group.id)}>
                        {group.label}
                      </button>
                      {activeFeature === group.id && (
                        <div className="feature-options">
                          {group.options.map((option) => (
                            <Link
                              key={option.label}
                              to={option.to}
                              className={`feature-option ${option.requiresAuth && !currentUser ? 'locked-action' : ''}`}
                              onClick={(event) => handleActionClick(event, option)}
                              title={option.requiresAuth && !currentUser ? 'Login required' : ''}
                            >
                              {option.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </article>
          </aside>
        </section>
      </header>

      <main className="page-section info-grid">
        <article className="info-card reveal-card revealed">
          <h3>Student-first onboarding</h3>
          <p>Register fast, upload your resume, add your stack, and start applying without switching tools.</p>
        </article>
        <article className="info-card reveal-card revealed">
          <h3>Structured job feed</h3>
          <p>Explore fresher jobs, internships, and developer roles in a professional feed-style layout.</p>
        </article>
        <article className="info-card reveal-card revealed">
          <h3>Company hiring dashboard</h3>
          <p>Post openings, separate jobs from internships, and review applicants in one place.</p>
        </article>
      </main>
    </>
  );
}
