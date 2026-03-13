import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createJob, getApplications, getCompanyJobs, getUser, updateUser } from '../api/api';

const USER_KEY = 'smartJobPortalUser';

const getCurrentUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

const formatSkills = (skills) => (skills || '').split(',').map((skill) => skill.trim()).filter(Boolean);
const getPostsKey = (userId) => `smartJobPortalPosts_${userId}`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [message, setMessage] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [showMoreApplications, setShowMoreApplications] = useState(false);
  const [studentApplications, setStudentApplications] = useState([]);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [companyApplications, setCompanyApplications] = useState([]);
  const [profileForm, setProfileForm] = useState({ name: '', skills: '', study: '', bio: '', avatar: null, resume: null });
  const [jobForm, setJobForm] = useState({ job_type: 'job', title: '', company: '', location: '', skills_required: '', salary: '', description: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadDashboard = async () => {
      try {
        const freshUser = await getUser(user.id);
        setUser(freshUser);
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        setProfileForm({ name: freshUser.name || '', skills: freshUser.skills || '', study: freshUser.study || '', bio: freshUser.bio || '', avatar: null, resume: null });
        setPosts(JSON.parse(localStorage.getItem(getPostsKey(freshUser.id)) || '[]'));

        if (freshUser.role === 'student') {
          setStudentApplications(await getApplications(freshUser.id, 'student'));
        } else {
          setCompanyJobs(await getCompanyJobs(freshUser.id));
          setCompanyApplications(await getApplications(freshUser.id, 'company'));
          setJobForm((prev) => ({ ...prev, company: freshUser.name }));
        }
      } catch (error) {
        setMessage(error.message);
      }
    };

    loadDashboard();
  }, [navigate]);

  const skillList = useMemo(() => formatSkills(user?.skills), [user?.skills]);
  const latestApplication = studentApplications[0];
  const otherApplications = studentApplications.slice(1);

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    navigate('/login');
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    const formData = new FormData();
    formData.append('name', profileForm.name);
    formData.append('skills', profileForm.skills);
    formData.append('study', profileForm.study);
    formData.append('bio', profileForm.bio);
    if (profileForm.avatar) formData.append('avatar', profileForm.avatar);
    if (profileForm.resume) formData.append('resume', profileForm.resume);

    try {
      const data = await updateUser(user.id, formData);
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setShowEdit(false);
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handlePublishPost = (event) => {
    event.preventDefault();
    if (!user || !postContent.trim()) return;

    const updatedPosts = [{ content: postContent.trim(), createdAt: new Date().toISOString() }, ...posts];
    localStorage.setItem(getPostsKey(user.id), JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
    setPostContent('');
  };

  const handleJobSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    try {
      await createJob({ ...jobForm, posted_by: user.id });
      setMessage('Posting created successfully.');
      setCompanyJobs(await getCompanyJobs(user.id));
      setCompanyApplications(await getApplications(user.id, 'company'));
      setJobForm({ job_type: 'job', title: '', company: user.name, location: '', skills_required: '', salary: '', description: '' });
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!user) return null;

  return (
    <>
      <header className="subpage-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>{user.role === 'company' ? 'Company dashboard' : 'Student dashboard'}</h1>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/jobs">Jobs</Link>
          <button className="button-link ghost type-button" type="button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="page-section dashboard-layout dashboard-profile-layout">
        <section className="profile-column">
          <article className="profile-showcase card-shell">
            <div className="profile-cover"></div>
            <div className="profile-avatar" style={user.avatar ? { backgroundImage: `url(${user.avatar})` } : {}}>{!user.avatar ? 'SJP' : ''}</div>
            <div className="profile-identity">
              <p className="profile-handle">@{user.name.toLowerCase().replace(/\s+/g, '')}</p>
              <h2>{user.name}</h2>
              <p className="profile-subline">{user.role === 'company' ? 'Hiring workspace overview' : 'Fresh talent profile overview'}</p>
            </div>
            <div className="profile-cta-row">
              <button className="button-link ghost type-button" type="button">Profile</button>
              <a className={`button-link ghost ${!user.resume ? 'disabled-link' : ''}`} href={user.resume || '#'} target="_blank" rel="noreferrer">Resume</a>
              <button className="button-link ghost type-button" type="button" onClick={() => setShowPost((value) => !value)}>{showPost ? 'Close Post' : 'Add Post'}</button>
              <button className="button-link accent type-button" type="button" onClick={() => setShowEdit((value) => !value)}>{showEdit ? 'Close Edit' : 'Edit'}</button>
            </div>
            <p className="profile-bio">{user.bio || 'Keep your profile updated so companies can review your skills, resume, and hiring readiness from one clean workspace.'}</p>
          </article>

          <article className="profile-info-card card-shell">
            <h2>Information</h2>
            <div className="profile-info-list">
              <div className="profile-info-row"><span className="profile-info-label">Email</span><span className="profile-info-value">{user.email}</span></div>
              <div className="profile-info-row"><span className="profile-info-label">Role</span><span className="profile-info-value">{user.role}</span></div>
              <div className="profile-info-row"><span className="profile-info-label">Study</span><span className="profile-info-value">{user.study || '-'}</span></div>
              <div className="profile-info-row"><span className="profile-info-label">Resume</span><span className="profile-info-value">{user.resume ? <a href={user.resume} target="_blank" rel="noreferrer">View resume</a> : 'Not uploaded'}</span></div>
              <div className="profile-info-row"><span className="profile-info-label">Joined</span><span className="profile-info-value">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span></div>
            </div>
            <div className="tag-row">{skillList.length ? skillList.map((skill) => <span className="tag" key={skill}>{skill}</span>) : <span className="tag">Add skills</span>}</div>
          </article>

          {showPost && (
            <section className="card-shell">
              <div className="section-headline"><div><p className="section-kicker">Profile Activity</p><h2>Add Post</h2></div></div>
              <form className="stack-form" onSubmit={handlePublishPost}>
                <div className="form-group"><label htmlFor="postContent">Write something</label><textarea id="postContent" rows="4" value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Share your learning progress, project update, or hiring availability"></textarea></div>
                <button type="submit" className="primary-btn">Publish post</button>
              </form>
              <div className="data-list">
                {posts.length ? posts.map((post) => (
                  <article className="post-card" key={post.createdAt}>
                    <p>{post.content}</p>
                    <div className="post-meta">{new Date(post.createdAt).toLocaleString()}</div>
                  </article>
                )) : <div className="empty-state">No posts yet. Use Add Post to share an update.</div>}
              </div>
            </section>
          )}

          {showEdit && (
            <section className="card-shell">
              <div className="section-headline"><div><p className="section-kicker">Profile Editor</p><h2>Edit Profile</h2></div></div>
              <form className="stack-form" onSubmit={handleProfileSubmit}>
                <div className="form-group"><label htmlFor="profileName">Name</label><input id="profileName" type="text" required value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
                <div className="form-group"><label htmlFor="profileEmail">Email</label><input id="profileEmail" type="email" value={user.email} disabled /></div>
                <div className="form-group"><label htmlFor="profileRole">Role</label><input id="profileRole" type="text" value={user.role} disabled /></div>
                <div className="form-group"><label htmlFor="profileSkills">Skills</label><textarea id="profileSkills" rows="3" value={profileForm.skills} onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}></textarea></div>
                <div className="form-group"><label htmlFor="profileStudy">Study</label><input id="profileStudy" type="text" value={profileForm.study} onChange={(e) => setProfileForm({ ...profileForm, study: e.target.value })} /></div>
                <div className="form-group"><label htmlFor="profileBio">Bio</label><textarea id="profileBio" rows="4" value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}></textarea></div>
                <div className="form-group"><label htmlFor="profileAvatar">Profile image</label><input id="profileAvatar" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.files?.[0] || null })} /></div>
                <div className="form-group"><label htmlFor="profileResume">Resume</label><input id="profileResume" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setProfileForm({ ...profileForm, resume: e.target.files?.[0] || null })} /></div>
                <button type="submit" className="primary-btn">Save profile</button>
              </form>
            </section>
          )}
        </section>

        <section className="dashboard-main-column">
          <section className="workspace-banner card-shell">
            <div>
              <p className="section-kicker">Overview</p>
              <h2>{user.role === 'company' ? 'Company workspace' : 'Student workspace'}</h2>
              <p>{user.role === 'company' ? 'Publish roles, review applicants, and manage your hiring workflow professionally.' : `Keep your profile hiring-ready and present your skills with a polished candidate summary${user.study ? ` • ${user.study}` : ''}.`}</p>
            </div>
            <div className="workspace-stats">
              <article className="stat-card"><span className="stat-label">Role</span><strong>{user.role}</strong></article>
              <article className="stat-card"><span className="stat-label">Skills</span><strong>{skillList.length}</strong></article>
              <article className="stat-card"><span className="stat-label">Resume</span><strong>{user.resume ? 'Uploaded' : 'Pending'}</strong></article>
            </div>
          </section>

          {user.role === 'student' ? (
            <section className="dashboard-panel">
              <div className="card-shell workspace-card">
                <div className="section-headline"><div><p className="section-kicker">Application Tracker</p><h2>My Apply's</h2></div></div>
                <div className="data-list">
                  {!studentApplications.length ? (
                    <div className="empty-state">No applications yet. Browse jobs and apply to see status here.</div>
                  ) : (
                    <>
                      {latestApplication ? (
                        <article className="data-card">
                          <h3>{latestApplication.title}</h3>
                          <div className="data-meta"><span>{latestApplication.company}</span><span>{latestApplication.location}</span><span>Status: {latestApplication.status}</span></div>
                          <p>Applied on {new Date(latestApplication.applied_date).toLocaleDateString()}</p>
                        </article>
                      ) : null}
                      {showMoreApplications && otherApplications.map((application) => (
                        <article className="data-card" key={application.id}>
                          <h3>{application.title}</h3>
                          <div className="data-meta"><span>{application.company}</span><span>{application.location}</span><span>Status: {application.status}</span></div>
                          <p>Applied on {new Date(application.applied_date).toLocaleDateString()}</p>
                        </article>
                      ))}
                      {otherApplications.length ? (
                        <button className="button-link ghost type-button" type="button" onClick={() => setShowMoreApplications((value) => !value)}>
                          {showMoreApplications ? 'See less' : 'See more'}
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </section>
          ) : (
            <section className="dashboard-panel">
              <div className="card-shell workspace-card">
                <div className="section-headline"><div><p className="section-kicker">Hiring Desk</p><h2>Create job or internship</h2></div></div>
                <form className="stack-form" onSubmit={handleJobSubmit}>
                  <div className="form-group"><label htmlFor="jobType">Type</label><select id="jobType" value={jobForm.job_type} onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}><option value="job">Full-time / Job</option><option value="internship">Internship</option></select></div>
                  <div className="form-group"><label htmlFor="jobTitle">Title</label><input id="jobTitle" type="text" required value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} /></div>
                  <div className="form-group"><label htmlFor="jobCompany">Company</label><input id="jobCompany" type="text" required value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} /></div>
                  <div className="form-group"><label htmlFor="jobLocation">Location</label><input id="jobLocation" type="text" required value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} /></div>
                  <div className="form-group"><label htmlFor="jobSkills">Skills required</label><input id="jobSkills" type="text" required value={jobForm.skills_required} onChange={(e) => setJobForm({ ...jobForm, skills_required: e.target.value })} /></div>
                  <div className="form-group"><label htmlFor="jobSalary">Salary / Stipend</label><input id="jobSalary" type="text" required value={jobForm.salary} onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })} /></div>
                  <div className="form-group"><label htmlFor="jobDescription">Description</label><textarea id="jobDescription" rows="4" required value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}></textarea></div>
                  <button type="submit" className="primary-btn">Publish role</button>
                </form>
              </div>
              <div className="card-shell workspace-card">
                <div className="section-headline"><div><p className="section-kicker">Open Positions</p><h2>Posted roles</h2></div></div>
                <div className="data-list">
                  {companyJobs.length ? companyJobs.map((job) => (
                    <article className="data-card" key={job.id}>
                      <h3>{job.title} <span className="type-label">{job.type}</span></h3>
                      <div className="data-meta"><span>{job.location}</span><span>{job.salary}</span></div>
                      <p>{job.description}</p>
                    </article>
                  )) : <div className="empty-state">No jobs posted yet. Use the form above to create the first job.</div>}
                </div>
              </div>
              <div className="card-shell workspace-card">
                <div className="section-headline"><div><p className="section-kicker">Pipeline</p><h2>Applicants</h2></div></div>
                <div className="data-list">
                  {companyApplications.length ? companyApplications.map((application) => (
                    <article className="data-card" key={application.id}>
                      <h3>{application.title} {application.type ? `(${application.type})` : ''}</h3>
                      <div className="data-meta"><span>{application.applicant_name}</span><span>{application.applicant_email}</span><span>Status: {application.status}</span></div>
                      <p><strong>Skills:</strong> {application.skills || 'Not provided'}</p>
                      <p><strong>Resume:</strong> {application.resume ? <a href={application.resume} target="_blank" rel="noreferrer">View resume</a> : 'Not uploaded'}</p>
                    </article>
                  )) : <div className="empty-state">No applicants yet. When students apply, they will appear here.</div>}
                </div>
              </div>
            </section>
          )}
          <p className={`page-message ${message ? 'success' : ''}`}>{message}</p>
        </section>
      </main>
    </>
  );
}
