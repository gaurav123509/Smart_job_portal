const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase, pingDatabase } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendPath = path.join(__dirname, '../frontend');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(frontendPath));

app.get('/', async (_req, res) => {
  try {
    await pingDatabase();
    return res.json({ message: 'Smart Job Portal API is running.' });
  } catch (error) {
    return res.status(500).json({ message: 'Database connection failed.', error: error.message });
  }
});

app.use('/', userRoutes);
app.use('/', jobRoutes);
app.use('/', applicationRoutes);

app.get('/app', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(500).json({ message: 'Internal server error.', error: error.message });
});

const startServer = async () => {
  try {
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      const baseUrl = `http://localhost:${PORT}`;
      console.log('\nSmart Job Portal started successfully');
      console.log(`Backend/API: ${baseUrl}`);
      console.log(`App Home: ${baseUrl}/app`);
      console.log(`Jobs Page: ${baseUrl}/jobs.html`);
      console.log(`Dashboard: ${baseUrl}/dashboard.html\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Change the PORT environment variable or stop the process using that port.`);
      } else {
        console.error('Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
