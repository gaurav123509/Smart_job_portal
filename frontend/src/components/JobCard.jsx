export default function JobCard({ job, onDetails, onApply, compact = false }) {
  const skills = (job.skills_required || '').split(',').map((skill) => skill.trim()).filter(Boolean);

  const companyInitials = job.company
    ? job.company.split(' ').map((word) => word[0]).join('').slice(0, 2)
    : 'SJ';

  return (
    <article className={`job-card card-shell ${compact ? 'job-card-compact' : ''}`}>
      <div className="job-card-top">
        <div className="job-card-identity">
          <div className="job-avatar">{companyInitials}</div>
          <div>
            <h3>{job.title}</h3>
            <p className="job-company">{job.company}</p>
          </div>
        </div>
        <div className="job-card-actions">
          <span className="featured-pill">Featured</span>
          <button className="bookmark-btn" type="button" aria-label="Save job">☆</button>
        </div>
      </div>
      <div className="job-meta">
        <span>{job.location}</span>
        <span>{job.salary}</span>
        <span className={`type-pill ${job.type}`}>{job.type || 'job'}</span>
      </div>
      <div className="tag-row">
        {skills.map((skill) => (
          <span className="tag" key={skill}>{skill}</span>
        ))}
      </div>
      {!compact ? <p>{job.description}</p> : null}
      <div className="job-actions">
        {onDetails ? <button className="button-link ghost type-button" type="button" onClick={() => onDetails(job.id)}>Details</button> : null}
        {onApply ? <button className="primary-btn" type="button" onClick={() => onApply(job)}>Apply Now</button> : null}
      </div>
    </article>
  );
}
