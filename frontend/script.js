const storedApiBaseUrl = localStorage.getItem('smartJobPortalApiBaseUrl');
const API_BASE_URL = storedApiBaseUrl || 'http://localhost:5001';
const page = document.body.dataset.page;

const getCurrentUser = () => {
  const raw = localStorage.getItem('smartJobPortalUser');
  return raw ? JSON.parse(raw) : null;
};

const setCurrentUser = (user) => {
  localStorage.setItem('smartJobPortalUser', JSON.stringify(user));
};

const clearCurrentUser = () => {
  localStorage.removeItem('smartJobPortalUser');
};

const setMessage = (elementId, message, type = 'success') => {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${type}`;
};

const formatSkills = (skills) => {
  if (!skills) return [];
  return skills.split(',').map((skill) => skill.trim()).filter(Boolean);
};

const attachLogout = () => {
  const logoutButton = document.getElementById('logoutButton');
  if (!logoutButton) return;

  logoutButton.addEventListener('click', () => {
    clearCurrentUser();
    window.location.href = 'login.html';
  });
};

const fetchJson = async (url, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(url, {
    ...options,
    headers: isFormData
      ? options.headers
      : {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
};

const renderEmptyState = (container, message) => {
  container.innerHTML = `<div class="empty-state">${message}</div>`;
};

const buildResumeMarkup = (resumeUrl) => {
  if (!resumeUrl) return 'Not uploaded';
  return `<a href="${resumeUrl}" target="_blank" rel="noreferrer">View resume</a>`;
};

const handleRegister = () => {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    try {
      const data = await fetchJson(`${API_BASE_URL}/register`, {
        method: 'POST',
        body: formData
      });

      setCurrentUser(data.user);
      setMessage('registerMessage', 'Registration successful. Redirecting to dashboard.');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 900);
    } catch (error) {
      setMessage('registerMessage', error.message, 'error');
    }
  });
};

const handleLogin = () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const data = await fetchJson(`${API_BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setCurrentUser(data.user);
      setMessage('loginMessage', 'Login successful. Redirecting to dashboard.');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 900);
    } catch (error) {
      setMessage('loginMessage', error.message, 'error');
    }
  });
};

const applyToJob = async (jobId) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  await fetchJson(`${API_BASE_URL}/apply`, {
    method: 'POST',
    body: JSON.stringify({
      user_id: currentUser.id,
      job_id: jobId
    })
  });
};

const renderJobs = async (filter = '') => {
  const jobsContainer = document.getElementById('jobsContainer');
  const jobsMessage = document.getElementById('jobsMessage');
  if (!jobsContainer) return;

  jobsMessage.textContent = '';

  try {
    const currentUser = getCurrentUser();
    let jobs;
    let headerText = '';

    // if a logged-in student with skills, show personalized recommendations
    if (currentUser && currentUser.role === 'student' && currentUser.skills) {
      const skillsParam = encodeURIComponent(currentUser.skills);
      jobs = await fetchJson(`${API_BASE_URL}/jobs/recommend?skills=${skillsParam}`);
      headerText = 'Recommended jobs based on your skills';
    } else {
      jobs = await fetchJson(`${API_BASE_URL}/jobs`);
    }

    if (filter) {
      jobs = jobs.filter((j) => j.type === filter);
    }

    if (!jobs.length) {
      renderEmptyState(jobsContainer, 'No jobs available yet. Companies can post jobs from the dashboard.');
      return;
    }

    if (headerText) {
      jobsContainer.insertAdjacentHTML('beforebegin', `<h2 class="section-heading">${headerText}</h2>`);
    }

    jobsContainer.innerHTML = jobs.map((job) => {
      const tags = formatSkills(job.skills_required).map((skill) => `<span class="tag">${skill}</span>`).join('');
      const canApply = currentUser && currentUser.role === 'student';
      const typeLabel = job.type ? `<span class="type-label">${job.type}</span>` : '';

      return `
        <article class="job-card">
          <h3>${job.title} ${typeLabel}</h3>
          <div class="job-meta">
            <span>${job.company}</span>
            <span>${job.location}</span>
            <span>${job.salary}</span>
          </div>
          <p>${job.description}</p>
          <div class="tag-row">${tags}</div>
          ${canApply ? `<button class="primary-btn apply-button" data-job-id="${job.id}" type="button">Apply Now</button>` : ''}
        </article>
      `;
    }).join('');

    document.querySelectorAll('.apply-button').forEach((button) => {
      button.addEventListener('click', async () => {
        try {
          await applyToJob(button.dataset.jobId);
          jobsMessage.textContent = 'Application submitted successfully.';
        } catch (error) {
          jobsMessage.textContent = error.message;
        }
      });
    });
  } catch (error) {
    jobsMessage.textContent = error.message;
  }
};

const fillProfile = (user) => {
  document.getElementById('profileName').value = user.name || '';
  document.getElementById('profileEmail').value = user.email || '';
  document.getElementById('profileRole').value = user.role || '';
  document.getElementById('profileSkills').value = user.skills || '';
  document.getElementById('profileResume').value = user.resume || 'No resume uploaded';
};

const renderStudentApplications = async (user) => {
  const container = document.getElementById('studentApplications');

  try {
    const applications = await fetchJson(`${API_BASE_URL}/applications?userId=${user.id}&role=student`);
    if (!applications.length) {
      renderEmptyState(container, 'No applications yet. Browse jobs and apply to see status here.');
      return;
    }

    container.innerHTML = applications.map((application) => `
      <article class="data-card">
        <h3>${application.title}</h3>
        <div class="data-meta">
          <span>${application.company}</span>
          <span>${application.location}</span>
          <span>Status: ${application.status}</span>
        </div>
        <p>Applied on ${new Date(application.applied_date).toLocaleDateString()}</p>
      </article>
    `).join('');
  } catch (error) {
    renderEmptyState(container, error.message);
  }
};

const renderCompanyJobs = async (user) => {
  const jobsContainer = document.getElementById('companyJobs');
  const internsContainer = document.getElementById('companyInternships');

  try {
    const jobs = await fetchJson(`${API_BASE_URL}/jobs/company/${user.id}`);
    if (!jobs.length) {
      renderEmptyState(jobsContainer, 'No jobs posted yet. Use the form above to create the first job.');
      renderEmptyState(internsContainer, 'No internships posted yet.');
      return;
    }

    const jobList = jobs.filter((j) => j.type === 'job');
    const internList = jobs.filter((j) => j.type === 'internship');

    if (jobList.length) {
      jobsContainer.innerHTML = jobList.map((job) => `
        <article class="data-card">
          <h3>${job.title} <span class="type-label">${job.type}</span></h3>
          <div class="data-meta">
            <span>${job.location}</span>
            <span>${job.salary}</span>
          </div>
          <p>${job.description}</p>
        </article>
      `).join('');
    } else {
      renderEmptyState(jobsContainer, 'No jobs posted yet. Use the form above to create the first job.');
    }

    if (internList.length) {
      internsContainer.innerHTML = internList.map((job) => `
        <article class="data-card">
          <h3>${job.title} <span class="type-label">${job.type}</span></h3>
          <div class="data-meta">
            <span>${job.location}</span>
            <span>${job.salary}</span>
          </div>
          <p>${job.description}</p>
        </article>
      `).join('');
    } else {
      renderEmptyState(internsContainer, 'No internships posted yet.');
    }
  } catch (error) {
    renderEmptyState(jobsContainer, error.message);
    renderEmptyState(internsContainer, error.message);
  }
};

const renderCompanyApplications = async (user) => {
  const container = document.getElementById('companyApplications');

  try {
    const applications = await fetchJson(`${API_BASE_URL}/applications?userId=${user.id}&role=company`);
    if (!applications.length) {
      renderEmptyState(container, 'No applicants yet. When students apply, they will appear here.');
      return;
    }

    container.innerHTML = applications.map((application) => `
      <article class="data-card">
        <h3>${application.title} ${application.type ? `(${application.type})` : ''}</h3>
        <div class="data-meta">
          <span>${application.applicant_name}</span>
          <span>${application.applicant_email}</span>
          <span>Status: ${application.status}</span>
        </div>
        <p><strong>Skills:</strong> ${application.skills || 'Not provided'}</p>
        <p><strong>Resume:</strong> ${buildResumeMarkup(application.resume)}</p>
      </article>
    `).join('');
  } catch (error) {
    renderEmptyState(container, error.message);
  }
};

const handleProfileUpdate = (user) => {
  const form = document.getElementById('profileForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('profileName').value.trim());
    formData.append('skills', document.getElementById('profileSkills').value.trim());

    const resumeFile = document.getElementById('profileResumeFile').files[0];
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }

    try {
      const data = await fetchJson(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        body: formData
      });
      setCurrentUser(data.user);
      fillProfile(data.user);
      document.getElementById('profileResumeFile').value = '';
      setMessage('profileMessage', 'Profile updated successfully.');
    } catch (error) {
      setMessage('profileMessage', error.message, 'error');
    }
  });
};

const handleJobCreation = (user) => {
  const form = document.getElementById('jobForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.posted_by = user.id;

    try {
      await fetchJson(`${API_BASE_URL}/create-job`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setMessage('jobMessage', 'Posting created successfully.');
      form.reset();
      document.getElementById('jobCompany').value = user.name;
      await renderCompanyJobs(user);
      await renderCompanyApplications(user);
    } catch (error) {
      setMessage('jobMessage', error.message, 'error');
    }
  });
};

const initDashboard = async () => {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const freshUser = await fetchJson(`${API_BASE_URL}/users/${user.id}`);
    setCurrentUser(freshUser);
    fillProfile(freshUser);
    handleProfileUpdate(freshUser);

    if (freshUser.role === 'student') {
      document.getElementById('dashboardHeading').textContent = 'Student dashboard';
      document.getElementById('studentDashboard').classList.remove('hidden');
      await renderStudentApplications(freshUser);
      return;
    }

    document.getElementById('dashboardHeading').textContent = 'Company dashboard';
    document.getElementById('companyDashboard').classList.remove('hidden');
    document.getElementById('jobCompany').value = freshUser.name;
    handleJobCreation(freshUser);
    await renderCompanyJobs(freshUser);
    await renderCompanyApplications(freshUser);
  } catch (error) {
    setMessage('profileMessage', error.message, 'error');
  }
};

const initJobsPage = () => {
  const refreshButton = document.getElementById('refreshJobsButton');
  const filterSelect = document.getElementById('jobFilter');

  const doRender = () => {
    const filter = filterSelect ? filterSelect.value : '';
    renderJobs(filter);
  };

  if (refreshButton) {
    refreshButton.addEventListener('click', doRender);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', doRender);
  }

  doRender();
};

attachLogout();

if (page === 'register') handleRegister();
if (page === 'login') handleLogin();
if (page === 'jobs') initJobsPage();
if (page === 'dashboard') initDashboard();
