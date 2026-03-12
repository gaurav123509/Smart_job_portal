# Smart Job Portal for Freshers

A full-stack web application built with HTML, CSS, JavaScript, Node.js, Express, and MySQL.

## Project Structure

```text
smart-job-portal/
  frontend/
    index.html
    login.html
    register.html
    jobs.html
    dashboard.html
    script.js
    style.css
  backend/
    server.js
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
    uploads/
  database/
    schema.sql
    README.txt
  package.json
  .env.example
  README.md
```

## Features

- Student and company registration/login
- Student profile creation and update
- Resume file upload using PDF, DOC, or DOCX
- Company job posting with separate job/internship option
- Job listing page connected with backend APIs
- Student job applications with duplicate-apply prevention
- Student and company dashboards
- Automatic database and table initialization on server startup

## Install Dependencies

```bash
npm install
```

## Configure Environment

1. Copy `.env.example` to `.env`
2. Set your MySQL credentials in `.env`
3. Keep `DB_NAME=smart_job_portal`
4. Optional: change `PORT` if `5000` is already in use

Example `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=smart_job_portal
```

## Run the Backend Server

```bash
npm run dev
```

or

```bash
npm start
```

The backend will:
- connect to MySQL
- create the `smart_job_portal` database if it does not exist
- create the `users`, `jobs`, and `applications` tables automatically

## Open the Frontend

Open these files in the browser:

1. `frontend/index.html`
2. `frontend/register.html`
3. `frontend/login.html`
4. `frontend/jobs.html`
5. `frontend/dashboard.html`

By default the frontend calls `http://localhost:5000`.
If you run the backend on another port, set this once in the browser console:

```js
localStorage.setItem('smartJobPortalApiBaseUrl', 'http://localhost:5001');
```

## API Endpoints

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

### Application APIs
- `POST /apply`
- `GET /applications?userId=USER_ID&role=student`
- `GET /applications?userId=USER_ID&role=company`

### Additional APIs
- `GET /jobs/recommend?skills=skill1,skill2` – return jobs whose `skills_required` field contains any of the comma‑separated skills provided

---

## Seeding / Demo Data
A simple script is included to populate the database with example students, companies, jobs and applications.

Run it once after the server has created the schema:

```bash
node backend/seed.js
```

It will create: 2 students, 1 company, 3 jobs, and one application, skipping entries that already exist. Adjust the file to add more samples as needed.

## MySQL Table Queries

Use [database/schema.sql](/Users/gauravtripathi/Downloads/smart-job-portal/database/schema.sql) if you want to create tables manually.

## Postman Testing

### 1. Register Student
- Method: `POST`
- URL: `http://localhost:5000/register`
- Body: `form-data`
- Fields:
  - `name`: `Aman Verma`
  - `email`: `aman@example.com`
  - `password`: `123456`
  - `role`: `student`
  - `skills`: `HTML, CSS, JavaScript`
  - `resume`: attach a PDF/DOC/DOCX file

### 2. Register Company
- Method: `POST`
- URL: `http://localhost:5000/register`
- Body: `form-data`
- Fields:
  - `name`: `NextHire Labs`
  - `email`: `hr@nexthire.com`
  - `password`: `123456`
  - `role`: `company`
  - `skills`: `Hiring, Recruitment`

### 3. Login
- Method: `POST`
- URL: `http://localhost:5000/login`
- Body: `raw JSON`

```json
{
  "email": "aman@example.com",
  "password": "123456"
}
```

### 4. Create Job / Internship
- Method: `POST`
- URL: `http://localhost:5000/create-job`
- Body: `raw JSON`

```json
{
  "job_type": "internship",    // "job" or "internship" (defaults to job)
  "title": "Frontend Intern",
  "company": "NextHire Labs",
  "location": "Remote",
  "skills_required": "HTML, CSS, JavaScript",
  "salary": "15000 per month",
  "description": "Work on landing pages and UI improvements.",
  "posted_by": 2
}
```

### 5. Get All Jobs
- Method: `GET`
- URL: `http://localhost:5000/jobs`

You can filter results client-side by type (job/internship) using the `jobFilter` dropdown present on the jobs page.

### 6. Get Single Job
- Method: `GET`
- URL: `http://localhost:5000/job/1`

### 7. Apply for Job
- Method: `POST`
- URL: `http://localhost:5000/apply`
- Body: `raw JSON`

```json
{
  "user_id": 1,
  "job_id": 1
}
```

### 8. Get Student Applications
- Method: `GET`
- URL: `http://localhost:5000/applications?userId=1&role=student`

### 9. Get Company Applicants
- Method: `GET`
- URL: `http://localhost:5000/applications?userId=2&role=company`

## Notes

- Passwords are hashed using `bcryptjs`
- Resume files are stored in `backend/uploads`
- Static resume files are served from `/uploads/...`
- The project still needs valid MySQL credentials in `.env` to run fully
