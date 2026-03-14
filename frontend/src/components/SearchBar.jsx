export default function SearchBar({
  title,
  onTitleChange,
  location,
  onLocationChange,
  onSubmit,
  buttonLabel = 'Search jobs',
  compact = false,
  showLocation = true,
  titlePlaceholder = 'Frontend Intern, Python Developer',
  locationPlaceholder = 'Remote, Pune, Bangalore'
}) {
  return (
    <form className={`search-bar ${compact ? 'search-bar-compact' : ''}`} onSubmit={onSubmit}>
      <div className="search-field">
        <label htmlFor="searchTitle">Role or skill</label>
        <input
          id="searchTitle"
          type="text"
          value={title}
          placeholder={titlePlaceholder}
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </div>
      {showLocation ? (
        <div className="search-field">
          <label htmlFor="searchLocation">Location</label>
          <input
            id="searchLocation"
            type="text"
            value={location}
            placeholder={locationPlaceholder}
            onChange={(event) => onLocationChange(event.target.value)}
          />
        </div>
      ) : null}
      <button className="primary-btn" type="submit">{buttonLabel}</button>
    </form>
  );
}
