const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant_name: {
    type: String,
    required: true
  },
  education: {
    type: String,
    required: true
  },
  skills_snapshot: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    default: 'Fresher'
  },
  cover_note: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'rejected'],
    default: 'pending'
  },
  applied_date: {
    type: Date,
    default: Date.now
  }
});

applicationSchema.index({ user_id: 1, job_id: 1 }, { unique: true });

const ApplicationModel = mongoose.models.Application || mongoose.model('Application', applicationSchema);

const Application = {
  async create({ userId, jobId, applicantName, education, skills, experience, coverNote }) {
    const application = await ApplicationModel.create({
      user_id: userId,
      job_id: jobId,
      applicant_name: applicantName,
      education,
      skills_snapshot: skills,
      experience,
      cover_note: coverNote,
      status: 'pending'
    });

    return String(application._id);
  },

  async findExisting(userId, jobId) {
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(jobId)) return null;
    return ApplicationModel.findOne({ user_id: userId, job_id: jobId }).lean();
  },

  async findByUser(userId) {
    if (!mongoose.isValidObjectId(userId)) return [];

    const applications = await ApplicationModel.find({ user_id: userId })
      .sort({ applied_date: -1 })
      .populate('job_id')
      .lean();

    return applications
      .filter((application) => application.job_id)
      .map((application) => ({
        id: String(application._id),
        status: application.status,
        applied_date: application.applied_date,
        applicant_name: application.applicant_name,
        education: application.education,
        skills_snapshot: application.skills_snapshot,
        experience: application.experience,
        job_id: String(application.job_id._id),
        title: application.job_id.title,
        company: application.job_id.company,
        location: application.job_id.location,
        salary: application.job_id.salary
      }));
  },

  async findByCompany(companyUserId) {
    if (!mongoose.isValidObjectId(companyUserId)) return [];

    const applications = await ApplicationModel.find()
      .sort({ applied_date: -1 })
      .populate({
        path: 'job_id',
        populate: {
          path: 'posted_by',
          select: 'name'
        }
      })
      .populate('user_id')
      .lean();

    return applications
      .filter((application) => {
        const postedById = application.job_id?.posted_by?._id || application.job_id?.posted_by;
        return postedById && String(postedById) === String(companyUserId);
      })
      .map((application) => ({
        id: String(application._id),
        status: application.status,
        applied_date: application.applied_date,
        job_id: String(application.job_id._id),
        applicant_name: application.applicant_name,
        education: application.education,
        skills_snapshot: application.skills_snapshot,
        experience: application.experience,
        cover_note: application.cover_note,
        title: application.job_id.title,
        company: application.job_id.company,
        type: application.job_id.type,
        applicant_id: String(application.user_id._id),
        applicant_profile_name: application.user_id.name,
        applicant_email: application.user_id.email,
        skills: application.user_id.skills || '',
        study: application.user_id.study || '',
        resume: application.user_id.resume || ''
      }));
  }
};

module.exports = Application;
