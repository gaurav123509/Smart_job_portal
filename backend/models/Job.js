const { getPool } = require('../config/db');

const Job = {
  async create({ title, company, location, type = 'job', skillsRequired, salary, description, postedBy }) {
    const [result] = await getPool().query(
      `INSERT INTO jobs (title, company, location, type, skills_required, salary, description, posted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, company, location, type, skillsRequired, salary, description, postedBy]
    );

    return result.insertId;
  },

  async findAll() {
    const [rows] = await getPool().query(
      `SELECT j.*, u.name AS recruiter_name
       FROM jobs j
       LEFT JOIN users u ON j.posted_by = u.id
       ORDER BY j.created_at DESC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await getPool().query(
      `SELECT j.*, u.name AS recruiter_name
       FROM jobs j
       LEFT JOIN users u ON j.posted_by = u.id
       WHERE j.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByCompanyUser(postedBy) {
    const [rows] = await getPool().query(
      'SELECT * FROM jobs WHERE posted_by = ? ORDER BY created_at DESC',
      [postedBy]
    );
    return rows;
  },

  async findBySkills(skillList) {
    if (!skillList.length) return [];
    // build a query with LIKE for each skill
    const conditions = skillList.map(() => 'j.skills_required LIKE ?').join(' OR ');
    const params = skillList.map((s) => `%${s}%`);
    const [rows] = await getPool().query(
      `SELECT j.*, u.name AS recruiter_name
       FROM jobs j
       LEFT JOIN users u ON j.posted_by = u.id
       WHERE ${conditions}
       ORDER BY j.created_at DESC`,
      params
    );
    return rows;
  }
};

module.exports = Job;
