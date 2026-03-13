# Smart Job Portal for Freshers

A full-stack web application built with HTML, CSS, JavaScript, Node.js, Express, and MongoDB.

## Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth utility: bcryptjs
- Uploads: multer

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
```

## Environment
Create `.env` from `.env.example` and set:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smart_job_portal?retryWrites=true&w=majority
```

## Install

```bash
npm install
```

## Seed Data

```bash
node backend/seed.js
```

This seeds:
- sample student user
- sample company user
- jobs from `database/seed_jobs.json`
- one sample application

## Run

```bash
npm start
```

or

```bash
npm run dev
```

## URLs
- App: `http://localhost:5001/app`
- Jobs: `http://localhost:5001/jobs.html`
- Dashboard: `http://localhost:5001/dashboard.html`

## APIs

### User APIs
- `POST /register`
- `POST /login`
- `GET /users/:id`
- `PUT /users/:id`

### Job APIs
- `POST /create-job`
- `GET /jobs`
- `GET /job/:id`
- `GET /jobs/company/:userId`
- `GET /jobs/recommend?skills=...`

### Application APIs
- `POST /apply`
- `GET /applications?userId=...&role=student`
- `GET /applications?userId=...&role=company`

## Collections
MongoDB collections used:
- `users`
- `jobs`
- `applications`

## Notes
- App data is stored in MongoDB Atlas when `MONGODB_URI` points to Atlas.
- Uploaded files are still stored in `backend/uploads` on the server filesystem.
- The frontend API contract remains unchanged after the database migration.
