const { getPool } = require('../config/db');

const Application = {
  async create({ userId, jobId, applicantName, education, skills, experience, coverNote }) {
    const [result] = await getPool().query(
      `INSERT INTO applications (
         user_id, job_id, applicant_name, education, skills_snapshot, experience, cover_note, status, applied_date
       ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [userId, jobId, applicantName, education, skills, experience, coverNote]
    );

    return result.insertId;
  },

  async findExisting(userId, jobId) {
    const [rows] = await getPool().query(
      'SELECT * FROM applications WHERE user_id = ? AND job_id = ? LIMIT 1',
      [userId, jobId]
    );
    return rows[0] || null;
  },

  async findByUser(userId) {
    const [rows] = await getPool().query(
      `SELECT a.id, a.status, a.applied_date, a.applicant_name, a.education, a.skills_snapshot, a.experience,
              j.id AS job_id, j.title, j.company, j.location, j.salary
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.user_id = ?
       ORDER BY a.applied_date DESC`,
      [userId]
    );
    return rows;
  },

  async findByCompany(companyUserId) {
    const [rows] = await getPool().query(
      `SELECT a.id, a.status, a.applied_date, a.job_id, a.applicant_name, a.education,
              a.skills_snapshot, a.experience, a.cover_note,
              j.title, j.company, j.type,
              u.id AS applicant_id, u.name AS applicant_profile_name, u.email AS applicant_email,
              u.skills, u.study, u.resume
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       INNER JOIN users u ON a.user_id = u.id
       WHERE j.posted_by = ?
       ORDER BY a.applied_date DESC`,
      [companyUserId]
    );
    return rows;
  }
};

module.exports = Application;
