const bcrypt = require('bcryptjs');
const { getPool, initializeDatabase } = require('./config/db');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

async function seed() {
  try {
    // ensure database and tables exist
    await initializeDatabase();

    // helper to insert user if not exists
    const insertUser = async ({ name, email, password, role, skills = '', resume = '' }) => {
      const existing = await User.findByEmail(email);
      if (existing) return existing.id;
      const hashed = await bcrypt.hash(password, 10);
      const id = await User.create({ name, email, password: hashed, role, skills, resume });
      console.log(`Created user ${name} (${role}) id=${id}`);
      return id;
    };

    const studentId1 = await insertUser({
      name: 'Alice Student',
      email: 'alice@example.com',
      password: 'password',
      role: 'student',
      skills: 'HTML, CSS, JavaScript',
      resume: ''
    });

    const studentId2 = await insertUser({
      name: 'Bob Learner',
      email: 'bob@example.com',
      password: 'password',
      role: 'student',
      skills: 'Python, SQL',
      resume: ''
    });

    const companyId = await insertUser({
      name: 'FreshHire Co',
      email: 'hr@freshhire.com',
      password: 'password',
      role: 'company',
      skills: 'Hiring, Recruitment',
      resume: ''
    });

    const jobData = [
      {
        title: 'Front‑end Intern',
        company: 'FreshHire Co',
        location: 'Remote',
        type: 'internship',
        skillsRequired: 'HTML, CSS, JavaScript',
        salary: '10k/month',
        description: 'Work on UI for our new portal.',
        postedBy: companyId
      },
      {
        title: 'Junior Python Developer',
        company: 'FreshHire Co',
        location: 'Onsite',
        type: 'job',
        skillsRequired: 'Python, SQL',
        salary: '20k/month',
        description: 'Help build data pipelines.',
        postedBy: companyId
      },
      {
        title: 'Data Analyst Intern',
        company: 'FreshHire Co',
        location: 'Remote',
        type: 'internship',
        skillsRequired: 'Excel, SQL, Python',
        salary: '12k/month',
        description: 'Analyze survey data.',
        postedBy: companyId
      }
    ];

    for (const j of jobData) {
      // naive check by title
      const existing = await getPool().query('SELECT id FROM jobs WHERE title = ? LIMIT 1', [j.title]);
      if (existing[0].length) continue;
      const id = await Job.create(j);
      console.log(`Created job ${j.title} id=${id}`);
    }

    // create one application if not exists
    const existingApp = await Application.findExisting(studentId1, 1);
    if (!existingApp) {
      const appId = await Application.create({ userId: studentId1, jobId: 1 });
      console.log(`Created application id=${appId}`);
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
