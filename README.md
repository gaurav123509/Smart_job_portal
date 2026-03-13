# Smart Job Portal for Freshers

Smart Job Portal is a client-server application for fresh graduates and hiring teams.

- Frontend: React + Vite
- Backend: Node.js + Express REST API
- Database: MongoDB Atlas
- Uploads: `multer`

## Architecture

- Frontend runs separately from backend.
- Frontend consumes backend APIs using a shared API base URL.
- Backend exposes REST endpoints only.
- MongoDB Atlas stores users, jobs, and applications.

## Project Structure

```text
smart-job-portal
frontend/
  index.html
  package.json
  vite.config.js
  public/
    _redirects
  src/
    api/
      api.js
    components/
      Navbar.jsx
      JobCard.jsx
      Toast.jsx
    pages/
      Home.jsx
      Login.jsx
      Register.jsx
      Jobs.jsx
      Dashboard.jsx
    styles/
      main.css
    App.jsx
    main.jsx
backend/
  server.js
  seed.js
  routes/
    userRoutes.js
    jobRoutes.js
    applicationRoutes.js
  config/
    db.js
  models/
    User.js
    Job.js
    Application.js
database/
  seed_jobs.json
  README.txt
render.yaml
netlify.toml
package.json
```

## Frontend Routes

- `/` -> Home
- `/login` -> Login
- `/register` -> Register
- `/jobs` -> Jobs listing
- `/dashboard` -> Dashboard

## Backend API Endpoints

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
- `GET /applications?userId=<id>&role=student`
- `GET /applications?userId=<id>&role=company`

### Health APIs
- `GET /`
- `GET /health`

## Frontend API Integration

Frontend API helpers live in [frontend/src/api/api.js](/Users/gauravtripathi/Downloads/smart-job-portal/frontend/src/api/api.js).

```js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
```

All requests use `API_BASE + endpoint`.

Examples:
- `getJobs()` -> `GET /jobs`
- `loginUser(payload)` -> `POST /login`
- `registerUser(formData)` -> `POST /register`
- `applyToJob(payload)` -> `POST /apply`
- `getApplications(userId, role)` -> `GET /applications`

## Environment Variables

### Root `.env`

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smart_job_portal?retryWrites=true&w=majority
CORS_ORIGINS=http://localhost:5173,http://localhost:8080,https://your-netlify-site.netlify.app
FRONTEND_PUBLIC_URL=https://your-netlify-site.netlify.app
```

### Frontend `.env` (optional)

Create `frontend/.env` only if you want to override the backend URL:

```env
VITE_API_BASE_URL=http://localhost:5001
```

## Install And Run

### 1. Install backend dependencies

```bash
npm install
```

### 2. Install frontend dependencies

```bash
npm --prefix frontend install
```

### 3. Seed database

```bash
npm run seed
```

### 4. Start backend

```bash
npm start
```

Backend runs on:
- `http://localhost:5001`
- `http://localhost:5001/health`

### 5. Start frontend

```bash
npm run frontend
```

Frontend runs on:
- `http://localhost:8080`

## Build Frontend

```bash
npm run frontend:build
```

Vite outputs production assets to:
- `frontend/dist`

## Verified Frontend Features

- React Router routing works
- Login page works with backend API
- Register page works with backend API
- Jobs page fetches jobs from backend
- Apply flow posts applications to backend
- Dashboard renders student/company views based on role
- Profile update uses `PUT /users/:id`

## Deployment

### Backend on Render

1. Push repo to GitHub.
2. Create a Render Web Service.
3. Use:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add env vars:
   - `MONGODB_URI`
   - `CORS_ORIGINS`
   - `FRONTEND_PUBLIC_URL`
5. Deploy.
6. Verify:
   - `https://smartjobportal-api.onrender.com/health`

### Frontend on Netlify

1. Create a Netlify site from GitHub.
2. Use [netlify.toml](/Users/gauravtripathi/Downloads/smart-job-portal/netlify.toml).
3. Netlify builds from:
   - base: `frontend`
   - command: `npm run build`
   - publish: `dist`
4. Add frontend env var if required:
   - `VITE_API_BASE_URL=https://smartjobportal-api.onrender.com`
5. Deploy.

## Example Production API URLs

- `https://smartjobportal-api.onrender.com/health`
- `https://smartjobportal-api.onrender.com/jobs`
- `https://smartjobportal-api.onrender.com/job/<jobId>`
- `https://smartjobportal-api.onrender.com/applications?userId=<userId>&role=student`

## Notes

- The old multi-page HTML frontend has been removed.
- The frontend is now fully React-based.
- Duplicate applications are prevented in backend.
- Resume and avatar uploads still use backend local storage; for durable production storage, move them to S3 or Cloudinary.
