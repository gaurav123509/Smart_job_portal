const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { initializeDatabase } = require('./config/db');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

const JOB_SEED_PATH = path.join(__dirname, '../database/seed_jobs.json');

async function seed() {
  try {
    await initializeDatabase();

    const insertUser = async ({ name, email, password, role, skills = '', study = '', bio = '', resume = '', avatar = '' }) => {
      const existing = await User.findByEmail(email);
      if (existing) return existing.id;

      const hashed = await bcrypt.hash(password, 10);
      const id = await User.create({ name, email, password: hashed, role, skills, study, bio, resume, avatar });
      console.log(`Created user ${name} (${role}) id=${id}`);
      return id;
    };

    const studentId = await insertUser({
      name: 'Alice Student',
      email: 'alice@example.com',
      password: 'password',
      role: 'student',
      skills: 'HTML, CSS, JavaScript',
      study: 'B.Tech CSE, Final Year'
    });

    const seedCompanyId = await insertUser({
      name: 'Seed Company',
      email: 'seed-company@smartjobportal.local',
      password: 'password',
      role: 'company',
      skills: 'Hiring, Recruitment'
    });

    const jobRows = JSON.parse(fs.readFileSync(JOB_SEED_PATH, 'utf8'));
    const existingJobs = await Job.findAll();
    const existingTitles = new Set(existingJobs.map((job) => job.title));

    for (const job of jobRows) {
      if (existingTitles.has(job.title)) continue;
      const id = await Job.create({
        ...job,
        postedBy: seedCompanyId
      });
      existingTitles.add(job.title);
      console.log(`Created job ${job.title} id=${id}`);
    }

    const refreshedJobs = await Job.findAll();
    const firstJob = refreshedJobs[0];
    if (firstJob) {
      const existingApp = await Application.findExisting(studentId, firstJob.id);
      if (!existingApp) {
        const appId = await Application.create({
          userId: studentId,
          jobId: firstJob.id,
          applicantName: 'Alice Student',
          education: 'B.Tech CSE, Final Year',
          skills: 'HTML, CSS, JavaScript',
          experience: 'Fresher',
          coverNote: 'Interested in frontend internships.'
        });
        console.log(`Created application id=${appId}`);
      }
    }

    console.log(`MongoDB seeding completed with ${jobRows.length} job templates.`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
