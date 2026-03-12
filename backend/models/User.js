const { getPool } = require('../config/db');

const User = {
  async create({ name, email, password, role, skills, study, bio, resume, avatar }) {
    const [result] = await getPool().query(
      `INSERT INTO users (name, email, password, role, skills, study, bio, resume, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password, role, skills, study, bio, resume, avatar]
    );

    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await getPool().query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await getPool().query(
      'SELECT id, name, email, role, skills, study, bio, resume, avatar, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async updateProfile(id, { name, skills, study, bio, resume, avatar }) {
    await getPool().query(
      'UPDATE users SET name = ?, skills = ?, study = ?, bio = ?, resume = ?, avatar = ? WHERE id = ?',
      [name, skills, study, bio, resume, avatar, id]
    );

    return this.findById(id);
  }
};

module.exports = User;
