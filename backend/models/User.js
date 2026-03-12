const { getPool } = require('../config/db');

const User = {
  async create({ name, email, password, role, skills, resume }) {
    const [result] = await getPool().query(
      `INSERT INTO users (name, email, password, role, skills, resume)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, password, role, skills, resume]
    );

    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await getPool().query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await getPool().query(
      'SELECT id, name, email, role, skills, resume, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async updateProfile(id, { name, skills, resume }) {
    await getPool().query(
      'UPDATE users SET name = ?, skills = ?, resume = ? WHERE id = ?',
      [name, skills, resume, id]
    );

    return this.findById(id);
  }
};

module.exports = User;
