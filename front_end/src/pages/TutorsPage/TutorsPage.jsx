import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import './TutorsPage.css';

/* Colour palette for tutor avatars */
const COLORS = ['#6c63ff','#00bfa5','#f06292','#ffb300','#42a5f5','#ef5350','#ab47bc','#26a69a'];
function getColor(i)  { return COLORS[i % COLORS.length]; }
function getInitials(name) { return (name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(); }

/* Min-rating options */
const RATING_OPTIONS = [
  { label: 'All Ratings', value: '' },
  { label: '⭐ 1+', value: '1' },
  { label: '⭐ 2+', value: '2' },
  { label: '⭐ 3+', value: '3' },
  { label: '⭐ 4+', value: '4' },
];

/* Star rating display component */
function StarRating({ rating }) {
  if (rating == null) return null;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="tp-stars" aria-label={`Rating: ${rating}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`tp-star ${i < full ? 'filled' : i === full && half ? 'half' : ''}`}>★</span>
      ))}
      <span className="tp-rating-num">{Number(rating).toFixed(1)}</span>
    </span>
  );
}

/* Single tutor card */
function TutorCard({ tutor, index }) {
  const color = getColor(index);
  return (
    <article className="tp-card">
      <div className="tp-avatar" style={{ background: color }}>{getInitials(tutor.name)}</div>
      <h3 className="tp-name">{tutor.name || 'Unknown'}</h3>
      <p className="tp-subject">{tutor.subject || '—'}</p>
      <p className="tp-bio">{tutor.bio || 'No bio available.'}</p>
      <div className="tp-meta">
        {tutor.hourlyRate != null && (
          <span className="tp-meta-item">💰 Rs. {tutor.hourlyRate}/hr</span>
        )}
        {tutor.email && <span className="tp-meta-item">✉️ {tutor.email}</span>}
      </div>
      {tutor.averageRating != null && <StarRating rating={tutor.averageRating} />}
      <Link to={`/tutors/${tutor.id}`} className="tp-btn">View Profile →</Link>
    </article>
  );
}

/* Skeleton loader card */
function SkeletonCard() {
  return (
    <div className="tp-card tp-skeleton">
      <div className="sk sk-avatar" />
      <div className="sk sk-lg" />
      <div className="sk sk-md" />
      <div className="sk sk-sm" />
      <div className="sk sk-full" />
    </div>
  );
}

export default function TutorsPage() {
  const [tutors,    setTutors]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');

  /* Filter state */
  const [sortBy,    setSortBy]    = useState('rate');
  const [subject,   setSubject]   = useState('');
  const [minRating, setMinRating] = useState('');
  const [subjects,  setSubjects]  = useState([]);

  /* Fetch distinct subjects for the dropdown */
  useEffect(() => {
    axiosInstance.get('/tutors/subjects')
      .then(res => setSubjects(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  /* Build query string and fetch tutors whenever filters change */
  const fetchTutors = useCallback(() => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (sortBy)    params.append('sortBy', sortBy);
    if (subject)   params.append('subject', subject);
    if (minRating) params.append('minRating', minRating);

    axiosInstance.get(`/tutors?${params.toString()}`)
      .then(res => setTutors(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load tutors. Please try again later.'))
      .finally(() => setLoading(false));
  }, [sortBy, subject, minRating]);

  useEffect(() => { fetchTutors(); }, [fetchTutors]);

  /* Reset all filters */
  const resetFilters = () => {
    setSortBy('rate');
    setSubject('');
    setMinRating('');
    setSearch('');
  };

  const hasActiveFilters = subject || minRating || search;

  /* Client-side filter by name (search bar) */
  const filtered = tutors.filter(t => {
    const q = search.toLowerCase();
    return (
      (t.name    || '').toLowerCase().includes(q) ||
      (t.subject || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="tp-page">
      {/* Hero */}
      <section className="tp-hero">
        <div className="tp-hero-content page-wrapper">
          <span className="tp-hero-tag">Our Educators</span>
          <h1 className="tp-hero-title">Meet Our Expert Tutors</h1>
          <p className="tp-hero-sub">
            Learn from passionate, qualified professionals dedicated to your success.
          </p>
          <div className="tp-hero-row">
            <input
              id="tutor-search"
              className="tp-search" type="text"
              placeholder="🔍  Search by name or subject…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <Link to="/register-tutor" className="btn-primary">✦ Register as Tutor</Link>
          </div>
        </div>
      </section>

      {/* ── Filter Bar ─────────────────────────────────── */}
      <section className="tp-filter-bar page-wrapper">
        <div className="tp-filters">
          {/* Sort by Rate */}
          <div className="tp-filter-group">
            <label htmlFor="filter-sort" className="tp-filter-label">Sort by</label>
            <select
              id="filter-sort"
              className="tp-filter-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="">Default</option>
              <option value="rate">Rate: Low → High</option>
            </select>
          </div>

          {/* Subject */}
          <div className="tp-filter-group">
            <label htmlFor="filter-subject" className="tp-filter-label">Subject</label>
            <select
              id="filter-subject"
              className="tp-filter-select"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Min Rating */}
          <div className="tp-filter-group">
            <label htmlFor="filter-rating" className="tp-filter-label">Min Rating</label>
            <select
              id="filter-rating"
              className="tp-filter-select"
              value={minRating}
              onChange={e => setMinRating(e.target.value)}
            >
              {RATING_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button className="tp-filter-reset" onClick={resetFilters}>
              ✕ Reset
            </button>
          )}
        </div>

        {!loading && !error && (
          <span className="tp-count">{filtered.length} tutor{filtered.length !== 1 ? 's' : ''} found</span>
        )}
      </section>

      {/* Grid */}
      <section className="tp-grid-section page-wrapper">
        {error && <div className="error-banner"><span>⚠</span>{error}</div>}
        <div className="tp-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map((t, i) => <TutorCard key={t.id ?? i} tutor={t} index={i} />)
          }
        </div>
        {!loading && !error && filtered.length === 0 && (
          <p className="tp-empty">No tutors found. Try adjusting your filters!</p>
        )}
      </section>

      {/* CTA */}
      <section className="tp-cta">
        <div className="tp-cta-inner">
          <h2>Are you an expert in your field?</h2>
          <p>Join our growing network of educators and make a difference.</p>
          <Link to="/register-tutor" className="btn-primary">Register as a Tutor →</Link>
        </div>
      </section>
    </div>
  );
}

