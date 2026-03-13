const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  category: {
    type: String,
    default: 'General'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['job', 'internship'],
    default: 'job'
  },
  skills_required: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  posted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const JobModel = mongoose.models.Job || mongoose.model('Job', jobSchema);

const toJobPayload = (job) => {
  if (!job) return null;

  const source = job.toObject ? job.toObject() : job;
  const recruiterName = source.posted_by && typeof source.posted_by === 'object'
    ? source.posted_by.name
    : undefined;

  return {
    id: String(source._id),
    category: source.category || 'General',
    title: source.title,
    company: source.company,
    location: source.location,
    type: source.type,
    skills_required: source.skills_required,
    salary: source.salary,
    description: source.description,
    posted_by: typeof source.posted_by === 'object' && source.posted_by !== null
      ? String(source.posted_by._id || source.posted_by.id)
      : String(source.posted_by),
    recruiter_name: recruiterName,
    created_at: source.created_at
  };
};

const populateRecruiter = (query) => query.populate('posted_by', 'name');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const Job = {
  async create({ title, company, location, type = 'job', skillsRequired, salary, description, postedBy, category = 'General' }) {
    const job = await JobModel.create({
      category,
      title,
      company,
      location,
      type,
      skills_required: skillsRequired,
      salary,
      description,
      posted_by: postedBy
    });

    return String(job._id);
  },

  async findAll() {
    const jobs = await populateRecruiter(JobModel.find().sort({ created_at: -1 })).lean();
    return jobs.map(toJobPayload);
  },

  async findById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    const job = await populateRecruiter(JobModel.findById(id)).lean();
    return toJobPayload(job);
  },

  async findByCompanyUser(postedBy) {
    if (!mongoose.isValidObjectId(postedBy)) return [];
    const jobs = await JobModel.find({ posted_by: postedBy }).sort({ created_at: -1 }).lean();
    return jobs.map(toJobPayload);
  },

  async findBySkills(skillList) {
    if (!skillList.length) return [];

    const regexConditions = skillList.map((skill) => ({
      skills_required: { $regex: escapeRegex(skill), $options: 'i' }
    }));

    const jobs = await populateRecruiter(
      JobModel.find({ $or: regexConditions }).sort({ created_at: -1 })
    ).lean();

    return jobs.map(toJobPayload);
  }
};

module.exports = Job;
