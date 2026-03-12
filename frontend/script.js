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

const showToast = (message, type = 'success') => {
  const toast = document.getElementById('toastPopup');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast-popup ${type}`;

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.className = 'toast-popup hidden';
  }, 2200);
};

const formatSkills = (skills) => {
  if (!skills) return [];
  return skills.split(',').map((skill) => skill.trim()).filter(Boolean);
};

const getWorkMode = (job) => {
  const location = (job.location || '').trim().toLowerCase();
  if (location.includes('hybrid')) return 'hybrid';
  if (location.includes('remote') || location.includes('online')) return 'online';
  return 'offline';
};

const populateCityFilter = (jobs) => {
  const cityFilter = document.getElementById('cityFilter');
  if (!cityFilter) return;

  const previousValue = cityFilter.value;
  const cityOptions = [...new Set(jobs.map((job) => job.location).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  cityFilter.innerHTML = '<option value="">All Cities</option>';
  cityOptions.forEach((city) => {
    cityFilter.insertAdjacentHTML('beforeend', `<option value="${city}">${city}</option>`);
  });

  if (cityOptions.includes(previousValue)) {
    cityFilter.value = previousValue;
  }
};

const attachLogout = () => {
  const logoutButton = document.getElementById('logoutButton');
  if (!logoutButton) return;

  logoutButton.addEventListener('click', () => {
    clearCurrentUser();
    window.location.href = 'login.html';
  });
};

const initProtectedActions = () => {
  const actions = document.querySelectorAll('[data-requires-login="true"]');
  if (!actions.length) return;

  const currentUser = getCurrentUser();

  actions.forEach((action) => {
    if (!currentUser) {
      action.classList.add('locked-action');
      action.title = 'Login required';
    } else {
      action.classList.remove('locked-action');
      action.title = '';
    }

    action.addEventListener('click', (event) => {
      if (!getCurrentUser()) {
        event.preventDefault();
        window.location.href = 'login.html';
      }
    });
  });
};

const initHomeFeatureActions = () => {
  const panelToggle = document.getElementById('toggleFeaturePanel');
  const panel = document.getElementById('featureActionsPanel');
  const toggles = document.querySelectorAll('[data-toggle-feature]');
  if (panelToggle && panel) {
    panelToggle.addEventListener('click', () => {
      const shouldOpen = panel.classList.contains('hidden');
      panel.classList.toggle('hidden', !shouldOpen);
      panelToggle.classList.toggle('is-open', shouldOpen);
    });
  }

  if (!toggles.length) return;

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.dataset.toggleFeature;
      const target = document.getElementById(targetId);
      const group = toggle.closest('.feature-group');
      if (!target || !group) return;

      const shouldOpen = target.classList.contains('hidden');

      document.querySelectorAll('.feature-group').forEach((featureGroup) => {
        featureGroup.classList.remove('is-open');
      });
      document.querySelectorAll('.feature-options').forEach((options) => {
        options.classList.add('hidden');
      });

      if (shouldOpen) {
        target.classList.remove('hidden');
        group.classList.add('is-open');
      }
    });
  });
};

const initHeroTyping = () => {
  const heroTitle = document.getElementById('heroTitle');
  if (!heroTitle) return;

  const fullText = heroTitle.dataset.text || heroTitle.textContent || '';
  if (!fullText) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroTitle.textContent = fullText;
    return;
  }

  heroTitle.textContent = '';
  heroTitle.classList.add('typing-active');

  let index = 0;
  const typeNextCharacter = () => {
    heroTitle.textContent = fullText.slice(0, index);
    index += 1;

    if (index <= fullText.length) {
      window.setTimeout(typeNextCharacter, 32);
      return;
    }

    heroTitle.classList.remove('typing-active');
  };

  window.setTimeout(typeNextCharacter, 180);
};

const initHomeCardReveal = () => {
  const cards = document.querySelectorAll('.reveal-card');
  if (!cards.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cards.forEach((card) => card.classList.add('revealed'));
    return;
  }

  cards.forEach((card, index) => {
    window.setTimeout(() => {
      card.classList.add('revealed');
    }, 180 + (index * 820));
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


const getProfilePostsKey = (userId) => `smartJobPortalPosts_${userId}`;

const toggleCardVisibility = (cardId, buttonId, openLabel, closeLabel, focusId = '') => {
  const card = document.getElementById(cardId);
  const button = document.getElementById(buttonId);
  if (!card || !button) return;

  const shouldOpen = card.classList.contains('hidden');
  card.classList.toggle('hidden', !shouldOpen);
  button.textContent = shouldOpen ? closeLabel : openLabel;

  if (shouldOpen && focusId) {
    const input = document.getElementById(focusId);
    if (input) input.focus();
  }
};

const renderProfilePosts = (user) => {
  const list = document.getElementById('profilePostsList');
  if (!list) return;

  const posts = JSON.parse(localStorage.getItem(getProfilePostsKey(user.id)) || '[]');
  if (!posts.length) {
    list.innerHTML = '<div class="empty-state">No posts yet. Use Add Post to share an update.</div>';
    return;
  }

  list.innerHTML = posts.map((post) => `
    <article class="post-card">
      <p>${post.content}</p>
      <div class="post-meta">${new Date(post.createdAt).toLocaleString()}</div>
    </article>
  `).join('');
};

const initProfilePosts = (user) => {
  const toggleButton = document.getElementById('toggleAddPost');
  const form = document.getElementById('profilePostForm');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => toggleCardVisibility('profilePostCard', 'toggleAddPost', 'Add Post', 'Close Post', 'postContent'));
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const contentField = document.getElementById('postContent');
      const message = document.getElementById('postMessage');
      const content = contentField.value.trim();

      if (!content) {
        if (message) setMessage('postMessage', 'Write something before posting.', 'error');
        return;
      }

      const key = getProfilePostsKey(user.id);
      const posts = JSON.parse(localStorage.getItem(key) || '[]');
      posts.unshift({ content, createdAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(posts));
      contentField.value = '';
      if (message) setMessage('postMessage', 'Post published successfully.');
      renderProfilePosts(user);
    });
  }

  renderProfilePosts(user);
};

const showJobDetails = async (jobId) => {
  const modal = document.getElementById('jobDetailsModal');
  if (!modal) return;

  try {
    const job = await fetchJson(`${API_BASE_URL}/job/${jobId}`);
    document.getElementById('jobDetailsCategory').textContent = job.category || 'Job Details';
    document.getElementById('jobDetailsTitle').textContent = job.title || 'Job Details';
    document.getElementById('jobDetailsMeta').innerHTML = `
      <span>${job.company}</span>
      <span>${job.location}</span>
      <span>${job.salary}</span>
    `;
    document.getElementById('jobDetailsDescription').textContent = job.description || 'No description available.';
    document.getElementById('jobDetailsRequirements').innerHTML = formatSkills(job.skills_required)
      .map((skill) => `<span class="tag">${skill}</span>`)
      .join('');
    document.getElementById('jobDetailsType').textContent = job.type || 'job';
    document.getElementById('jobDetailsRecruiter').textContent = job.recruiter_name || job.company || 'Not specified';

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  } catch (error) {
    const jobsMessage = document.getElementById('jobsMessage');
    if (jobsMessage) {
      jobsMessage.textContent = error.message;
    }
  }
};

const closeJobDetails = () => {
  const modal = document.getElementById('jobDetailsModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
};

const toggleProfileEditCard = (forceOpen = null) => {
  const editCard = document.getElementById('profileEditCard');
  const toggleButton = document.getElementById('toggleProfileEdit');
  if (!editCard || !toggleButton) return;

  const shouldOpen = forceOpen === null ? editCard.classList.contains('hidden') : forceOpen;
  editCard.classList.toggle('hidden', !shouldOpen);
  toggleButton.textContent = shouldOpen ? 'Close Edit' : 'Edit';

  if (shouldOpen) {
    const nameInput = document.getElementById('profileName');
    if (nameInput) {
      nameInput.focus();
    }
  }
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


const openApplyModal = (jobId) => {
  const modal = document.getElementById('jobApplyModal');
  const currentUser = getCurrentUser();
  if (!modal || !currentUser) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('applyJobId').value = jobId;
  document.getElementById('applyName').value = currentUser.name || '';
  document.getElementById('applyEducation').value = currentUser.study || '';
  document.getElementById('applySkills').value = currentUser.skills || '';
  document.getElementById('applyExperience').value = 'Fresher';
  document.getElementById('applyCoverNote').value = currentUser.bio || '';
  setMessage('applyMessage', '');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
};

const closeApplyModal = () => {
  const modal = document.getElementById('jobApplyModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
};

const initApplyForm = () => {
  const form = document.getElementById('jobApplyForm');
  const closeButton = document.getElementById('closeJobApply');
  const modal = document.getElementById('jobApplyModal');
  if (closeButton) {
    closeButton.addEventListener('click', closeApplyModal);
  }
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target.dataset.closeApplyModal === 'true') {
        closeApplyModal();
      }
    });
  }
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }

    try {
      await fetchJson(`${API_BASE_URL}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: currentUser.id,
          job_id: document.getElementById('applyJobId').value,
          applicant_name: document.getElementById('applyName').value.trim(),
          education: document.getElementById('applyEducation').value.trim(),
          skills: document.getElementById('applySkills').value.trim(),
          experience: document.getElementById('applyExperience').value.trim(),
          cover_note: document.getElementById('applyCoverNote').value.trim()
        })
      });
      setMessage('applyMessage', 'Application submitted successfully.');
      showToast('Apply successfully');
      setTimeout(() => closeApplyModal(), 700);
      const jobsMessage = document.getElementById('jobsMessage');
      if (jobsMessage) jobsMessage.textContent = 'Application submitted successfully.';
    } catch (error) {
      setMessage('applyMessage', error.message, 'error');
    }
  });
};

const renderJobs = async (filter = '', category = '', city = '', mode = '') => {
  const jobsContainer = document.getElementById('jobsContainer');
  const jobsMessage = document.getElementById('jobsMessage');
  const jobsHeaderNote = document.getElementById('jobsHeaderNote');
  if (!jobsContainer) return;

  jobsMessage.textContent = '';
  if (jobsHeaderNote) {
    jobsHeaderNote.innerHTML = '';
  }

  try {
    const currentUser = getCurrentUser();
    let jobs = await fetchJson(`${API_BASE_URL}/jobs`);
    populateCityFilter(jobs);

    if (currentUser && currentUser.role === 'student' && currentUser.skills && jobsHeaderNote) {
      const recommendedJobs = await fetchJson(
        `${API_BASE_URL}/jobs/recommend?skills=${encodeURIComponent(currentUser.skills)}`
      );
      jobsHeaderNote.innerHTML = `
        <div class="card-shell">
          <h2>All jobs are shown below</h2>
          <p>
            Based on your profile skills, <strong>${recommendedJobs.length}</strong> recommended roles also match you.
          </p>
        </div>
      `;
    }

    if (filter) {
      jobs = jobs.filter((j) => j.type === filter);
    }

    if (category) {
      jobs = jobs.filter((j) => j.category === category);
    }

    if (city) {
      jobs = jobs.filter((j) => j.location === city);
    }

    if (mode) {
      jobs = jobs.filter((j) => getWorkMode(j) === mode);
    }

    if (!jobs.length) {
      renderEmptyState(jobsContainer, 'No jobs available yet. Companies can post jobs from the dashboard.');
      return;
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
          <div class="job-actions">
            <button class="primary-btn secondary details-button" data-job-id="${job.id}" type="button">Details</button>
            ${canApply ? `<button class="primary-btn apply-button" data-job-id="${job.id}" type="button">Apply Now</button>` : ''}
          </div>
        </article>
      `;
    }).join('');

    document.querySelectorAll('.details-button').forEach((button) => {
      button.addEventListener('click', async () => {
        await showJobDetails(button.dataset.jobId);
      });
    });

    document.querySelectorAll('.apply-button').forEach((button) => {
      button.addEventListener('click', () => {
        openApplyModal(button.dataset.jobId);
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
  document.getElementById('profileStudy').value = user.study || '';
  document.getElementById('profileBio').value = user.bio || '';
  document.getElementById('profileResume').value = user.resume || 'No resume uploaded';

  const heroName = document.getElementById('profileHeroName');
  const heroHandle = document.getElementById('profileHeroHandle');
  const heroSubline = document.getElementById('profileHeroSubline');
  const infoEmail = document.getElementById('profileInfoEmail');
  const infoRole = document.getElementById('profileInfoRole');
  const infoStudy = document.getElementById('profileInfoStudy');
  const infoResume = document.getElementById('profileInfoResume');
  const infoJoined = document.getElementById('profileInfoJoined');
  const resumeAction = document.getElementById('profileResumeAction');
  const skillPreview = document.getElementById('profileSkillPreview');
  const profileAvatar = document.getElementById('profileAvatar');
  const profileBioText = document.getElementById('profileBioText');
  const workspaceTitle = document.getElementById('workspaceTitle');
  const workspaceSubtitle = document.getElementById('workspaceSubtitle');
  const workspaceRoleStat = document.getElementById('workspaceRoleStat');
  const workspaceSkillsStat = document.getElementById('workspaceSkillsStat');
  const workspaceResumeStat = document.getElementById('workspaceResumeStat');
  const skillList = formatSkills(user.skills);

  if (heroName) heroName.textContent = user.name || 'Smart Job Profile';
  if (profileAvatar) {
    if (user.avatar) {
      profileAvatar.style.backgroundImage = `url(${user.avatar})`;
      profileAvatar.style.backgroundSize = 'cover';
      profileAvatar.style.backgroundPosition = 'center';
      profileAvatar.textContent = '';
    } else {
      profileAvatar.style.backgroundImage = '';
      profileAvatar.textContent = (user.name || 'SJP').split(/\s+/).slice(0,2).map((part) => part[0]).join('').slice(0,2).toUpperCase();
    }
  }
  if (heroHandle) heroHandle.textContent = `@${(user.name || 'smartjobportal').toLowerCase().replace(/\s+/g, '')}`;
  if (heroSubline) {
    heroSubline.textContent = `${user.role === 'company' ? 'Hiring dashboard' : 'Fresher candidate'} • ${user.email || 'Profile active'}`;
  }
  if (profileBioText) {
    profileBioText.textContent = user.bio || 'Keep your profile updated so companies can review your skills, resume, and hiring readiness from one clean workspace.';
  }
  if (infoEmail) infoEmail.textContent = user.email || '-';
  if (infoRole) infoRole.textContent = user.role || '-';
  if (infoStudy) infoStudy.textContent = user.study || (user.role === 'student' ? 'Add study details' : '-');
  if (infoResume) {
    infoResume.innerHTML = user.resume
      ? `<a href="${user.resume}" target="_blank" rel="noreferrer">Open resume</a>`
      : 'Not uploaded';
  }
  if (infoJoined) {
    infoJoined.textContent = user.created_at
      ? new Date(user.created_at).toLocaleDateString()
      : '-';
  }
  if (resumeAction) {
    if (user.resume) {
      resumeAction.href = user.resume;
      resumeAction.classList.remove('disabled-link');
    } else {
      resumeAction.href = '#';
      resumeAction.classList.add('disabled-link');
    }
  }
  if (skillPreview) {
    skillPreview.innerHTML = skillList.length
      ? skillList.map((skill) => `<span class="tag">${skill}</span>`).join('')
      : '<span class="tag">Add skills</span>';
  }
  if (workspaceTitle) {
    workspaceTitle.textContent = user.role === 'company' ? 'Company workspace' : 'Student workspace';
  }
  if (workspaceSubtitle) {
    workspaceSubtitle.textContent = user.role === 'company'
      ? 'Publish roles, review applicants, and manage your hiring workflow professionally.'
      : `Keep your profile hiring-ready and present your skills with a polished candidate summary${user.study ? ` • ${user.study}` : ''}.`;
  }
  if (workspaceRoleStat) workspaceRoleStat.textContent = user.role || 'Student';
  if (workspaceSkillsStat) workspaceSkillsStat.textContent = String(skillList.length);
  if (workspaceResumeStat) workspaceResumeStat.textContent = user.resume ? 'Uploaded' : 'Pending';
};

const renderStudentApplications = async (user) => {
  const container = document.getElementById('studentApplications');
  if (!container) return;

  try {
    const applications = await fetchJson(`${API_BASE_URL}/applications?userId=${user.id}&role=student`);
    if (!applications.length) {
      renderEmptyState(container, 'No applications yet. Browse jobs and apply to see status here.');
      return;
    }

    const [latestApplication, ...otherApplications] = applications;
    const buildApplicationCard = (application) => `
      <article class="data-card">
        <h3>${application.title}</h3>
        <div class="data-meta">
          <span>${application.company}</span>
          <span>${application.location}</span>
          <span>Status: ${application.status}</span>
        </div>
        <p>Applied on ${new Date(application.applied_date).toLocaleDateString()}</p>
      </article>
    `;

    container.innerHTML = `
      ${buildApplicationCard(latestApplication)}
      ${otherApplications.length ? `
        <div id="moreApplications" class="hidden">
          ${otherApplications.map(buildApplicationCard).join('')}
        </div>
        <button id="toggleApplicationsButton" class="button-link ghost type-button" type="button">See more</button>
      ` : ''}
    `;

    const toggleButton = document.getElementById('toggleApplicationsButton');
    const moreApplications = document.getElementById('moreApplications');
    if (toggleButton && moreApplications) {
      toggleButton.addEventListener('click', () => {
        const shouldOpen = moreApplications.classList.contains('hidden');
        moreApplications.classList.toggle('hidden', !shouldOpen);
        toggleButton.textContent = shouldOpen ? 'See less' : 'See more';
      });
    }
  } catch (error) {
    renderEmptyState(container, error.message);
  }
};

const renderCompanyJobs = async (user) => {
  const jobsContainer = document.getElementById('companyJobs');

  try {
    const jobs = await fetchJson(`${API_BASE_URL}/jobs/company/${user.id}`);
    if (!jobs.length) {
      renderEmptyState(jobsContainer, 'No jobs posted yet. Use the form above to create the first job.');
      return;
    }

    jobsContainer.innerHTML = jobs.map((job) => `
        <article class="data-card">
          <h3>${job.title} <span class="type-label">${job.type}</span></h3>
          <div class="data-meta">
            <span>${job.location}</span>
            <span>${job.salary}</span>
          </div>
          <p>${job.description}</p>
        </article>
      `).join('');
  } catch (error) {
    renderEmptyState(jobsContainer, error.message);
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
    formData.append('study', document.getElementById('profileStudy').value.trim());
    formData.append('bio', document.getElementById('profileBio').value.trim());

    const avatarFile = document.getElementById('profileAvatarFile').files[0];
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

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
      document.getElementById('profileAvatarFile').value = '';
      document.getElementById('profileResumeFile').value = '';
      setMessage('profileMessage', 'Profile updated successfully.');
      toggleProfileEditCard(false);
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
    initProfilePosts(freshUser);
    const editToggle = document.getElementById('toggleProfileEdit');
    if (editToggle) {
      editToggle.addEventListener('click', () => toggleProfileEditCard());
    }

    const studentDashboard = document.getElementById('studentDashboard');
    const companyDashboard = document.getElementById('companyDashboard');

    if (freshUser.role === 'student') {
      document.getElementById('dashboardHeading').textContent = 'Student dashboard';
      if (studentDashboard) studentDashboard.classList.remove('hidden');
      if (companyDashboard) companyDashboard.classList.add('hidden');
      await renderStudentApplications(freshUser);
      return;
    }

    document.getElementById('dashboardHeading').textContent = 'Company dashboard';
    if (studentDashboard) studentDashboard.classList.add('hidden');
    if (companyDashboard) companyDashboard.classList.remove('hidden');
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
  const categorySelect = document.getElementById('categoryFilter');
  const citySelect = document.getElementById('cityFilter');
  const modeSelect = document.getElementById('modeFilter');
  const closeButton = document.getElementById('closeJobDetails');
  const modal = document.getElementById('jobDetailsModal');

  const doRender = () => {
    const filter = filterSelect ? filterSelect.value : '';
    const category = categorySelect ? categorySelect.value : '';
    const city = citySelect ? citySelect.value : '';
    const mode = modeSelect ? modeSelect.value : '';
    renderJobs(filter, category, city, mode);
  };

  if (refreshButton) {
    refreshButton.addEventListener('click', doRender);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', doRender);
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', doRender);
  }

  if (citySelect) {
    citySelect.addEventListener('change', doRender);
  }

  if (modeSelect) {
    modeSelect.addEventListener('change', doRender);
  }

  if (closeButton) {
    closeButton.addEventListener('click', closeJobDetails);
  }

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target.dataset.closeModal === 'true') {
        closeJobDetails();
      }
    });
  }

  doRender();
};

attachLogout();
initProtectedActions();
initApplyForm();

if (page === 'register') handleRegister();
if (page === 'login') handleLogin();
if (page === 'jobs') initJobsPage();
if (page === 'dashboard') initDashboard();
if (page === 'home') {
  initHomeFeatureActions();
  initHeroTyping();
  initHomeCardReveal();
}
