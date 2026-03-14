const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const PRIMARY_URI = process.env.MONGODB_URI;
const FALLBACK_URI = process.env.MONGODB_URI_FALLBACK || 'mongodb://127.0.0.1:27017/smart_job_portal';

let isConnecting = false;
let activeUri = null;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    return mongoose.connection;
  }

  isConnecting = true;

  try {
    const uriList = PRIMARY_URI ? [PRIMARY_URI, FALLBACK_URI] : [FALLBACK_URI];
    const maxRetries = 3;

    for (const uri of uriList) {
      for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
        try {
          await mongoose.connect(uri, {
            autoIndex: true,
            serverSelectionTimeoutMS: 4000
          });
          activeUri = uri;
          return mongoose.connection;
        } catch (error) {
          const isLastAttempt = attempt === maxRetries;
          if (isLastAttempt) {
            break;
          }
          // Exponential-ish backoff: 1s, 2s
          await wait(attempt * 1000);
        }
      }
    }

    throw new Error('Unable to connect to any configured MongoDB URI. Tried primary then fallback.');
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
  MONGODB_URI: PRIMARY_URI || FALLBACK_URI,
  activeUri: () => activeUri,
  connectDatabase,
  initializeDatabase,
  pingDatabase
};
