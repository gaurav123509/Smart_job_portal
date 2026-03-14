import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import Toast from '../components/Toast';
import SearchBar from '../components/SearchBar';
import { applyToJob, getJobById, getJobs, getRecommendedJobs } from '../api/api';

const USER_KEY = 'smartJobPortalUser';

const getCurrentUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

const getWorkMode = (location) => {
  const value = (location || '').toLowerCase();
  if (value.includes('hybrid')) return 'hybrid';
  if (value.includes('remote') || value.includes('online')) return 'online';
  return 'offline';
};

const formatSkills = (skills) => (skills || '').split(',').map((skill) => skill.trim()).filter(Boolean);

export default function Jobs() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [jobs, setJobs] = useState([]);
  const [headerNote, setHeaderNote] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState('');
  const [filters, setFilters] = useState({ type: '', category: '', city: '', mode: '', query: '', location: '' });
  const [detailJob, setDetailJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [applyError, setApplyError] = useState('');
  const [applyForm, setApplyForm] = useState({ applicant_name: '', education: '', skills: '', experience: 'Fresher', cover_note: '' });

  useEffect(() => {
    const storedSearch = localStorage.getItem('smartJobPortalSearch');
    if (storedSearch) {
      try {
        const parsed = JSON.parse(storedSearch);
        setFilters((prev) => ({
          ...prev,
          query: parsed.title || '',
          location: parsed.location || ''
        }));
      } catch (_error) {
        // ignore
      }
      localStorage.removeItem('smartJobPortalSearch');
    }

    const loadJobs = async () => {
      try {
        const allJobs = await getJobs();
        setJobs(allJobs);

        if (currentUser?.skills) {
          try {
            const recommended = await getRecommendedJobs(currentUser.skills);
            if (recommended.length) {
              setHeaderNote(`Recommended roles found for your skills: ${currentUser.skills}`);
            }
          } catch (_error) {
            setHeaderNote('');
          }
        }
      } catch (error) {
        setMessage(error.message);
      }
    };

    loadJobs();
  }, [currentUser?.skills]);

  const cities = useMemo(() => [...new Set(jobs.map((job) => job.location).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [jobs]);

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const query = filters.query.trim().toLowerCase();
    const location = filters.location.trim().toLowerCase();
    if (query) {
      const haystack = `${job.title} ${job.company} ${job.skills_required}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (location) {
      if (!job.location?.toLowerCase().includes(location)) return false;
    }
    if (filters.type && job.type !== filters.type) return false;
    if (filters.category && job.category !== filters.category) return false;
    if (filters.city && job.location !== filters.city) return false;
    if (filters.mode && getWorkMode(job.location) !== filters.mode) return false;
    return true;
  }), [jobs, filters]);

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    setCurrentUser(null);
    navigate('/login');
  };

  const handleDetails = async (jobId) => {
    try {
      const job = await getJobById(jobId);
      setDetailJob(job);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const openApply = (job) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setApplyJob(job);
    setApplyError('');
    setApplyForm({
      applicant_name: currentUser.name || '',
      education: currentUser.study || '',
      skills: currentUser.skills || '',
      experience: 'Fresher',
      cover_note: currentUser.bio || ''
    });
  };

  const handleApplySubmit = async (event) => {
    event.preventDefault();
    if (!currentUser || !applyJob) return;

    try {
      await applyToJob({
        user_id: currentUser.id,
        job_id: applyJob.id,
        ...applyForm
      });
      setApplyJob(null);
      setToast('Apply successfully');
      window.setTimeout(() => setToast(''), 2200);
    } catch (error) {
      setApplyError(error.message);
    }
  };

  return (
    <>
      <Navbar currentUser={currentUser} onLogout={handleLogout} compact />
      <header className="jobs-hero">
        <div className="jobs-hero-inner">
          <p className="jobs-hero-kicker">Find your perfect role</p>
          <h1>Find Your Perfect Role</h1>
          <p className="jobs-hero-subtitle">{filteredJobs.length} opportunities waiting for you</p>
          <div className="jobs-hero-search">
            <SearchBar
              title={filters.query}
              onTitleChange={(value) => setFilters((prev) => ({ ...prev, query: value }))}
              location={filters.location}
              onLocationChange={(value) => setFilters((prev) => ({ ...prev, location: value }))}
              onSubmit={(event) => event.preventDefault()}
              buttonLabel="Filter"
            />
          </div>
          <div className="jobs-hero-filters">
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">All types</option>
              <option value="job">Jobs</option>
              <option value="internship">Internships</option>
            </select>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="">All categories</option>
              <option value="Python Developer Jobs">Python Developer</option>
              <option value="Java Developer Jobs">Java Developer</option>
              <option value="Full Stack Developer Jobs">Full Stack</option>
              <option value="Frontend Developer Jobs">Front-end</option>
              <option value="UI/UX Jobs">UI/UX</option>
            </select>
            <select value={filters.mode} onChange={(e) => setFilters({ ...filters, mode: e.target.value })}>
              <option value="">Any mode</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <button
              className="button-link ghost type-button"
              type="button"
              onClick={() => setFilters({ type: '', category: '', city: '', mode: '', query: '', location: '' })}
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="page-section">
        <div className="jobs-count">Showing {filteredJobs.length} results</div>

        {headerNote ? <div className="page-message success">{headerNote}</div> : null}
        <section className="jobs-grid">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onDetails={handleDetails} onApply={openApply} />
          ))}
        </section>
        <p className="page-message">{message}</p>
      </main>

      {detailJob && (
        <section className="modal-shell" aria-hidden="false">
          <div className="modal-backdrop" onClick={() => setDetailJob(null)}></div>
          <div className="modal-card" role="dialog" aria-modal="true">
            <button className="modal-close" type="button" aria-label="Close details" onClick={() => setDetailJob(null)}>x</button>
            <p className="eyebrow">{detailJob.category}</p>
            <h2>{detailJob.title}</h2>
            <div className="job-meta">
              <span>{detailJob.company}</span>
              <span>{detailJob.location}</span>
              <span>{detailJob.salary}</span>
            </div>
            <p>{detailJob.description}</p>
            <div>
              <h3>Requirements</h3>
              <div className="tag-row">
                {formatSkills(detailJob.skills_required).map((skill) => <span className="tag" key={skill}>{skill}</span>)}
              </div>
            </div>
            <div className="detail-list">
              <p><strong>Type:</strong> {detailJob.type}</p>
              <p><strong>Recruiter:</strong> {detailJob.recruiter_name || detailJob.company}</p>
            </div>
          </div>
        </section>
      )}

      {applyJob && (
        <section className="modal-shell" aria-hidden="false">
          <div className="modal-backdrop" onClick={() => setApplyJob(null)}></div>
          <div className="modal-card" role="dialog" aria-modal="true">
            <button className="modal-close" type="button" aria-label="Close application" onClick={() => setApplyJob(null)}>x</button>
            <p className="eyebrow">Application Form</p>
            <h2>Apply for job</h2>
            <form className="stack-form" onSubmit={handleApplySubmit}>
              <div className="form-group"><label htmlFor="applyName">Full name</label><input id="applyName" type="text" required value={applyForm.applicant_name} onChange={(e) => setApplyForm({ ...applyForm, applicant_name: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="applyEducation">Education</label><input id="applyEducation" type="text" required value={applyForm.education} onChange={(e) => setApplyForm({ ...applyForm, education: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="applySkills">Skills</label><textarea id="applySkills" rows="3" required value={applyForm.skills} onChange={(e) => setApplyForm({ ...applyForm, skills: e.target.value })}></textarea></div>
              <div className="form-group"><label htmlFor="applyExperience">Experience</label><input id="applyExperience" type="text" value={applyForm.experience} onChange={(e) => setApplyForm({ ...applyForm, experience: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="applyCoverNote">Why should you be considered?</label><textarea id="applyCoverNote" rows="4" value={applyForm.cover_note} onChange={(e) => setApplyForm({ ...applyForm, cover_note: e.target.value })}></textarea></div>
              <button type="submit" className="primary-btn">Submit Application</button>
              <p className="form-message error">{applyError}</p>
            </form>
          </div>
        </section>
      )}

      <Toast message={toast} />
    </>
  );
}
