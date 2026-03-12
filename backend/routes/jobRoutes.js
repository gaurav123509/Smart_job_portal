const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');

const router = express.Router();

router.post('/create-job', async (req, res) => {
  try {
    const { title, company, location, job_type, skills_required, salary, description, posted_by } = req.body;

    if (!title || !company || !location || !skills_required || !salary || !description || !posted_by) {
      return res.status(400).json({ message: 'All job fields are required.' });
    }

    const type = job_type && job_type === 'internship' ? 'internship' : 'job';

    const companyUser = await User.findById(posted_by);
    if (!companyUser || companyUser.role !== 'company') {
      return res.status(403).json({ message: 'Only company users can create jobs.' });
    }

    const jobId = await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      type,
      skillsRequired: skills_required.trim(),
      salary: salary.trim(),
      description: description.trim(),
      postedBy: posted_by
    });

    const job = await Job.findById(jobId);
    return res.status(201).json({ message: 'Job created successfully.', job });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create job.', error: error.message });
  }
});

router.get('/jobs', async (_req, res) => {
  try {
    const jobs = await Job.findAll();
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch jobs.', error: error.message });
  }
});

router.get('/job/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    return res.json(job);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch job.', error: error.message });
  }
});

router.get('/jobs/company/:userId', async (req, res) => {
  try {
    const jobs = await Job.findByCompanyUser(req.params.userId);
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch company jobs.', error: error.message });
  }
});

// simple recommendation endpoint based on comma-separated skills
router.get('/jobs/recommend', async (req, res) => {
  try {
    const { skills } = req.query;
    if (!skills) {
      return res.status(400).json({ message: 'skills query parameter is required (comma separated).' });
    }
    const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (!skillList.length) {
      return res.status(400).json({ message: 'At least one skill must be provided.' });
    }

    // delegate filter to model
    const jobs = await Job.findBySkills(skillList);
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch recommended jobs.', error: error.message });
  }
});

module.exports = router;
