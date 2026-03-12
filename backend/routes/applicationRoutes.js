const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

const router = express.Router();

router.post('/apply', async (req, res) => {
  try {
    const { user_id, job_id } = req.body;

    if (!user_id || !job_id) {
      return res.status(400).json({ message: 'User ID and job ID are required.' });
    }

    const user = await User.findById(user_id);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can apply for jobs.' });
    }

    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const existingApplication = await Application.findExisting(user_id, job_id);
    if (existingApplication) {
      return res.status(409).json({ message: 'You have already applied for this job.' });
    }

    const applicationId = await Application.create({ userId: user_id, jobId: job_id });
    return res.status(201).json({
      message: 'Application submitted successfully.',
      applicationId
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to apply for the job.', error: error.message });
  }
});

router.get('/applications', async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({ message: 'userId and role query parameters are required.' });
    }

    if (role === 'student') {
      const applications = await Application.findByUser(userId);
      return res.json(applications);
    }

    if (role === 'company') {
      const applications = await Application.findByCompany(userId);
      return res.json(applications);
    }

    return res.status(400).json({ message: 'Invalid role provided.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch applications.', error: error.message });
  }
});

module.exports = router;
