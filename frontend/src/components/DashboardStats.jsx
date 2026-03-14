export default function DashboardStats({ stats }) {
  return (
    <div className="dashboard-stats">
      {stats.map((stat) => (
        <article key={stat.label} className="stat-card">
          <span className="stat-label">{stat.label}</span>
          <strong>{stat.value}</strong>
          {stat.helper ? <span className="stat-helper">{stat.helper}</span> : null}
        </article>
      ))}
    </div>
  );
}
