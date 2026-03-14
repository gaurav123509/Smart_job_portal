export default function Sidebar({ items, activeId, onSelect }) {
  return (
    <aside className="sidebar">
      <p className="sidebar-title">Dashboard</p>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-link ${activeId === item.id ? 'active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
