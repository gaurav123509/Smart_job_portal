const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_job_portal'
};

let pool;

const createPool = () => mysql.createPool({
  host: DB_CONFIG.host,
  user: DB_CONFIG.user,
  password: DB_CONFIG.password,
  database: DB_CONFIG.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const initializeDatabase = async () => {
  const connection = await mysql.createConnection({
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
  await connection.query(`USE \`${DB_CONFIG.database}\``);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(120) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('student', 'company') NOT NULL,
      skills TEXT,
      resume VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      category VARCHAR(100) DEFAULT 'General',
      title VARCHAR(150) NOT NULL,
      company VARCHAR(150) NOT NULL,
      location VARCHAR(120) NOT NULL,
      type ENUM('job','internship') NOT NULL DEFAULT 'job',
      skills_required TEXT NOT NULL,
      salary VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      posted_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_jobs_posted_by FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  const [categoryColumns] = await connection.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = 'jobs'
       AND COLUMN_NAME = 'category'`,
    [DB_CONFIG.database]
  );

  if (!categoryColumns.length) {
    await connection.query(`
      ALTER TABLE jobs
      ADD COLUMN category VARCHAR(100) DEFAULT 'General' AFTER id
    `);
  }

  // attempt to add type column if legacy schema lacks it
  try {
    await connection.query("ALTER TABLE jobs ADD COLUMN type ENUM('job','internship') NOT NULL DEFAULT 'job'");
  } catch (e) {
    // ignore errors (column probably exists)
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      job_id INT NOT NULL,
      status ENUM('pending', 'shortlisted', 'rejected') DEFAULT 'pending',
      applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      CONSTRAINT unique_user_job UNIQUE (user_id, job_id)
    )
  `);

  await connection.end();
  pool = createPool();
  return pool;
};

const getPool = () => {
  if (!pool) {
    pool = createPool();
  }

  return pool;
};

module.exports = {
  DB_CONFIG,
  getPool,
  initializeDatabase
};
