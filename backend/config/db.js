const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_job_portal';

let isConnecting = false;

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    return mongoose.connection;
  }

  isConnecting = true;

  try {
    await mongoose.connect(MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    });

    return mongoose.connection;
  } finally {
    isConnecting = false;
  }
};

const initializeDatabase = async () => connectDatabase();

const pingDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB is not connected.');
  }

  await mongoose.connection.db.admin().ping();
  return true;
};

module.exports = {
  MONGODB_URI,
  connectDatabase,
  initializeDatabase,
  pingDatabase
};
