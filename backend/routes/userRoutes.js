const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const User = require('../models/User');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const resumeTypes = ['.pdf', '.doc', '.docx'];
    const imageTypes = ['.jpg', '.jpeg', '.png', '.webp'];

    if (file.fieldname === 'resume') {
      if (!resumeTypes.includes(extension)) {
        cb(new Error('Resume must be a PDF, DOC, or DOCX file.'));
        return;
      }
      cb(null, true);
      return;
    }

    if (file.fieldname === 'avatar') {
      if (!imageTypes.includes(extension)) {
        cb(new Error('Profile image must be JPG, JPEG, PNG, or WEBP.'));
        return;
      }
      cb(null, true);
      return;
    }

    cb(new Error('Unsupported upload field.'));
  }
});

const profileUpload = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'avatar', maxCount: 1 }
]);

const buildFilePath = (req, fieldName, fallback = '') => {
  const file = req.files?.[fieldName]?.[0];
  if (!file) {
    return fallback;
  }

  return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
};

router.post('/register', profileUpload, async (req, res) => {
  try {
    const { name, email, password, role, skills, study, bio } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    if (!['student', 'company'].includes(role)) {
      return res.status(400).json({ message: 'Role must be student or company.' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role,
      skills: skills || '',
      study: study || '',
      bio: bio || '',
      resume: buildFilePath(req, 'resume'),
      avatar: buildFilePath(req, 'avatar')
    });

    const user = await User.findById(userId);
    return res.status(201).json({ message: 'Registration successful.', user });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to register user.', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findByEmail(email.trim());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const safeUser = await User.findById(user.id);
    return res.json({ message: 'Login successful.', user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login.', error: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user.', error: error.message });
  }
});

router.put('/users/:id', profileUpload, async (req, res) => {
  try {
    const { name, skills, study, bio } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updatedUser = await User.updateProfile(req.params.id, {
      name: name.trim(),
      skills: skills || '',
      study: study || '',
      bio: bio || '',
      resume: buildFilePath(req, 'resume', existingUser.resume || ''),
      avatar: buildFilePath(req, 'avatar', existingUser.avatar || '')
    });

    return res.json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile.', error: error.message });
  }
});

router.use((error, _req, res, next) => {
  if (
    error instanceof multer.MulterError ||
    error.message.includes('Resume must be') ||
    error.message.includes('Profile image must be') ||
    error.message.includes('Unsupported upload field')
  ) {
    return res.status(400).json({ message: error.message });
  }

  return next(error);
});

module.exports = router;
