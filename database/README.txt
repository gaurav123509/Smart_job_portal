Smart Job Portal MongoDB seed assets

Files included:
- seed_jobs.json: Mongo-friendly job seed data

How it is used:
1. Configure `MONGODB_URI` in `.env`.
2. Run `node backend/seed.js`.
3. The script seeds sample users, jobs, and one sample application into MongoDB Atlas or your local MongoDB instance.
