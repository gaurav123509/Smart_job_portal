export default function JobCard({ job, onDetails, onApply }) {
  const skills = (job.skills_required || '').split(',').map((skill) => skill.trim()).filter(Boolean);

  return (
    <article className="job-card card-shell">
      <p className="section-kicker">{job.category}</p>
      <h3>{job.title}</h3>
      <div className="job-meta">
        <span>{job.company}</span>
        <span>{job.location}</span>
        <span>{job.salary}</span>
      </div>
      <div className="tag-row">
        {skills.map((skill) => (
          <span className="tag" key={skill}>{skill}</span>
        ))}
      </div>
      <p>{job.description}</p>
      <div className="job-actions">
        <button className="button-link ghost type-button" type="button" onClick={() => onDetails(job.id)}>Details</button>
        <button className="primary-btn" type="button" onClick={() => onApply(job)}>Apply Now</button>
      </div>
    </article>
  );
}
