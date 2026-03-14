import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import { getJobs } from '../api/api';

const CURRENT_USER_KEY = 'smartJobPortalUser';

const categories = [
  { title: 'Python', description: 'Backend, data, and automation roles', theme: 'python' },
  { title: 'Java', description: 'Enterprise and backend development tracks', theme: 'java' },
  { title: 'Full Stack', description: 'Frontend + backend hybrid roles', theme: 'fullstack' },
  { title: 'Frontend', description: 'UI engineering and product design builds', theme: 'frontend' },
  { title: 'UI/UX', description: 'Product and experience design openings', theme: 'uiux' }
];

const getCurrentUser = () => {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export default function Home() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [jobs, setJobs] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch (_error) {
        setJobs([]);
      }
    };

    loadJobs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
    navigate('/login');
  };

  const featuredJobs = useMemo(() => jobs.slice(0, 3), [jobs]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const payload = { title: searchTitle.trim(), location: searchLocation.trim() };
    localStorage.setItem('smartJobPortalSearch', JSON.stringify(payload));
    navigate('/jobs');
  };

  return (
    <>
      <header className="hero-shell home-hero">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />

        <section className="home-hero-grid">
          <div className="home-hero-content">
            <span className="home-badge">#1 Job Portal for Freshers</span>
            <h1>
              Your First Job <span className="accent">Starts Here</span>
            </h1>
            <div className="home-search">
              <SearchBar
                title={searchTitle}
                onTitleChange={setSearchTitle}
                location={searchLocation}
                onLocationChange={setSearchLocation}
                onSubmit={handleSearchSubmit}
                buttonLabel="Search Jobs"
                showLocation={false}
                titlePlaceholder="Job title, skill, or company..."
              />
            </div>
            <div className="home-tag-row">
              {['React', 'Python', 'Marketing', 'Design'].map((tag) => (
                <span className="home-tag" key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="home-illustration">
            <div className="hero-poster">
              <img src="/hiring-poster.png" alt="We are hiring poster" />
            </div>
          </div>
        </section>
      </header>

      <section className="home-stats">
        <div className="home-stat">
          <span className="stat-icon">🏢</span>
          <strong>10,000+</strong>
          <span>Active Jobs</span>
        </div>
        <div className="home-stat">
          <span className="stat-icon">📄</span>
          <strong>2,500+</strong>
          <span>Companies</span>
        </div>
        <div className="home-stat">
          <span className="stat-icon">🎓</span>
          <strong>50,000+</strong>
          <span>Students Hired</span>
        </div>
        <div className="home-stat">
          <span className="stat-icon">✅</span>
          <strong>95%</strong>
          <span>Success Rate</span>
        </div>
      </section>

      <main className="page-section">
        <section className="section-shell">
          <div className="section-head">
            <div>
              <p className="section-kicker">Categories</p>
              <h2>Explore high-demand tracks</h2>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <article key={category.title} className={`category-card ${category.theme}`}>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <button className="button-link ghost type-button" type="button" onClick={() => navigate('/jobs')}>Explore</button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
