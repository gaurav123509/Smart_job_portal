# Smart Job Portal for Freshers

Smart Job Portal is now structured as a proper client-server application:
- Frontend: static HTML/CSS/JS deployed separately
- Backend: Node.js + Express REST API deployed separately
- Database: MongoDB Atlas

## Current Architecture

- Frontend deploy target: Netlify
- Backend deploy target: Render
- Database: MongoDB Atlas
- File uploads: `multer` storing files in `backend/uploads`

## Project Structure

```text
smart-job-portal
frontend
  index.html
  login.html
  register.html
  jobs.html
  dashboard.html
  script.js
  style.css
backend
  server.js
  seed.js
  routes
    userRoutes.js
    jobRoutes.js
    applicationRoutes.js
  config
    db.js
  models
    User.js
    Job.js
    Application.js
database
  seed_jobs.json
render.yaml
netlify.toml
```

## Environment Variables

Create `.env` from `.env.example`:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smart_job_portal?retryWrites=true&w=majority
CORS_ORIGINS=https://your-netlify-site.netlify.app
FRONTEND_PUBLIC_URL=https://your-netlify-site.netlify.app
```

## API Base Setup In Frontend

`frontend/script.js` uses a single API base variable:

```js
const DEPLOYED_API_BASE = 'https://smartjobportal-api.onrender.com';
const storedApiBaseUrl = localStorage.getItem('smartJobPortalApiBaseUrl');
const isLocalFrontend = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_BASE = (
  window.SMART_JOB_PORTAL_API_BASE ||
  storedApiBaseUrl ||
  (isLocalFrontend ? 'http://localhost:5001' : DEPLOYED_API_BASE)
).replace(/\/$/, '');
```

All API calls use `API_BASE + endpoint`.

## REST API Endpoints

### User APIs
- `POST /register`
- `POST /login`
- `GET /users/:id`
- `PUT /users/:id`

### Job APIs
- `GET /jobs`
- `GET /job/:id`
- `POST /create-job`
- `GET /jobs/company/:userId`
- `GET /jobs/recommend?skills=...`

### Application APIs
- `POST /apply`
- `GET /applications?userId=...&role=student`
- `GET /applications?userId=...&role=company`

### Health API
- `GET /health`
- `GET /`

## Example API URLs

If backend is deployed on Render:
- `https://smartjobportal-api.onrender.com/health`
- `https://smartjobportal-api.onrender.com/jobs`
- `https://smartjobportal-api.onrender.com/job/<jobId>`
- `https://smartjobportal-api.onrender.com/applications?userId=<userId>&role=student`

## Local Run

### Install dependencies

```bash
npm install
```

### Seed MongoDB data

```bash
node backend/seed.js
```

### Start backend locally

```bash
npm start
```

### Start frontend locally

```bash
npm run frontend
```

Frontend will be available at:
- `http://localhost:8080`
- `http://localhost:8080/dashboard.html`

For local backend testing, frontend automatically uses `http://localhost:5001`.

## Render Deployment Steps For Backend

1. Push this repository to GitHub.
2. Create a new Web Service in Render.
3. Connect the GitHub repository.
4. Use:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables in Render:
   - `MONGODB_URI`
   - `CORS_ORIGINS`
   - `FRONTEND_PUBLIC_URL`
6. Deploy.
7. After deployment, verify:
   - `https://smartjobportal-api.onrender.com/health`
   - `https://smartjobportal-api.onrender.com/jobs`

## Netlify Deployment Steps For Frontend

1. Create a new site in Netlify.
2. Connect the same GitHub repository.
3. Set publish directory to:
   - `frontend`
4. No build command is required.
5. Deploy the site.
6. In production, frontend will use:
   - `https://smartjobportal-api.onrender.com`
   as the default API base.

## Error Handling

Backend routes return structured JSON errors such as:

```json
{
  "message": "Failed to fetch jobs.",
  "error": "Server error details"
}
```

## Uploads

Resume and avatar uploads are handled through `multer`.
Uploaded files are served from:
- `/uploads/<filename>`

## Data Model

MongoDB collections:
- `users`
- `jobs`
- `applications`

## Notes

- Duplicate applications are prevented by a compound unique index on `user_id + job_id`.
- CORS is controlled by `CORS_ORIGINS`.
- Backend no longer serves frontend pages; frontend and backend are deployed separately.
