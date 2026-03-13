const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');

const buildUrl = (endpoint) => `${API_BASE}${endpoint}`;

const parseResponse = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
};

const request = async (endpoint, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(buildUrl(endpoint), {
    ...options,
    headers: isFormData
      ? options.headers
      : {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
  });

  return parseResponse(response);
};

export { API_BASE };

export const registerUser = (formData) => request('/register', { method: 'POST', body: formData });
export const loginUser = (payload) => request('/login', { method: 'POST', body: JSON.stringify(payload) });
export const getJobs = () => request('/jobs');
export const getJobById = (jobId) => request(`/job/${jobId}`);
export const createJob = (payload) => request('/create-job', { method: 'POST', body: JSON.stringify(payload) });
export const applyToJob = (payload) => request('/apply', { method: 'POST', body: JSON.stringify(payload) });
export const getApplications = (userId, role) => request(`/applications?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`);
export const getUser = (userId) => request(`/users/${userId}`);
export const updateUser = (userId, formData) => request(`/users/${userId}`, { method: 'PUT', body: formData });
export const getCompanyJobs = (userId) => request(`/jobs/company/${userId}`);
export const getRecommendedJobs = (skills) => request(`/jobs/recommend?skills=${encodeURIComponent(skills)}`);
