const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'company'],
    required: true
  },
  skills: {
    type: String,
    default: ''
  },
  study: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  resume: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

const toSafeUser = (user) => {
  if (!user) return null;

  const source = user.toObject ? user.toObject() : user;
  return {
    id: String(source._id),
    name: source.name,
    email: source.email,
    role: source.role,
    skills: source.skills || '',
    study: source.study || '',
    bio: source.bio || '',
    resume: source.resume || '',
    avatar: source.avatar || '',
    created_at: source.created_at
  };
};

const User = {
  async create({ name, email, password, role, skills, study, bio, resume, avatar }) {
    const user = await UserModel.create({
      name,
      email,
      password,
      role,
      skills,
      study,
      bio,
      resume,
      avatar
    });

    return String(user._id);
  },

  async findByEmail(email) {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (!user) return null;

    return {
      ...user,
      id: String(user._id)
    };
  },

  async findById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    const user = await UserModel.findById(id).lean();
    return toSafeUser(user);
  },

  async updateProfile(id, { name, skills, study, bio, resume, avatar }) {
    if (!mongoose.isValidObjectId(id)) return null;

    const updated = await UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          skills,
          study,
          bio,
          resume,
          avatar
        }
      },
      { new: true }
    ).lean();

    return toSafeUser(updated);
  }
};

module.exports = User;
