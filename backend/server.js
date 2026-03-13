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
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set('trust proxy', 1);

app.use(cors({
  origin(origin, callback) {
    if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', async (_req, res) => {
  try {
    await pingDatabase();
    return res.json({ message: 'Smart Job Portal REST API is running.' });
  } catch (error) {
    return res.status(500).json({ message: 'Database connection failed.', error: error.message });
  }
});

app.get('/health', async (_req, res) => {
  try {
    await pingDatabase();
    return res.json({ status: 'ok' });
  } catch (error) {
    return res.status(500).json({ status: 'error', error: error.message });
  }
});

app.use('/', userRoutes);
app.use('/', jobRoutes);
app.use('/', applicationRoutes);

app.use((error, _req, res, _next) => {
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error.', error: error.message });
});

const startServer = async () => {
  try {
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      const baseUrl = `http://localhost:${PORT}`;
      console.log('\nSmart Job Portal started successfully');
      console.log(`REST API: ${baseUrl}`);
      console.log(`Health: ${baseUrl}/health`);
      if (process.env.FRONTEND_PUBLIC_URL) {
        console.log(`Frontend: ${process.env.FRONTEND_PUBLIC_URL}`);
      }
      console.log('');
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
