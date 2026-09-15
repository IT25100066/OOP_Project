import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import './TutorProfile.css';

const COLORS = ['#6c63ff','#00bfa5','#f06292','#ffb300','#42a5f5','#ef5350','#ab47bc','#26a69a'];
function getColor(id) { return COLORS[Number(id) % COLORS.length]; }
function getInitials(name) { return (name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(); }

function InfoRow({ icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="tpr-info-row">
      <span className="tpr-info-icon">{icon}</span>
      <div>
        <span className="tpr-info-label">{label}</span>
        <span className="tpr-info-value">{value}</span>
      </div>
    </div>
  );
}

/*
 * TutorProfile — loads a single tutor from GET /api/tutors/:id
 * Backend returns: { id, name, subject, bio, hourlyRate, averageRating, email, username }
 * Students who are logged in can book the tutor.
 */
export default function TutorProfile() {
  const { id } = useParams();
  const { user, isStudent } = useAuth();

  const [tutor,   setTutor]   = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Booking state
  const [booking,     setBooking]     = useState(false);
  const [bookMsg,     setBookMsg]     = useState('');
  const [bookErr,     setBookErr]     = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [mode,        setMode]        = useState('');

  // Review state
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [revMsg,  setRevMsg]  = useState('');
  const [revErr,  setRevErr]  = useState('');

  useEffect(() => {
    // Load tutor details
    axiosInstance.get(`/tutors/${id}`)
      .then(res => setTutor(res.data))
      .catch(() => setError('Tutor not found or could not be loaded.'))
      .finally(() => setLoading(false));

    // Load tutor reviews
    axiosInstance.get(`/reviews/tutor/${id}`)
      .then(res => setReviews(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!requestDate) { setBookErr('Please select a request date.'); return; }
    if (!mode.trim()) { setBookErr('Please enter the preferred mode.'); return; }
    setBooking(true); setBookMsg(''); setBookErr('');
    try {
      await axiosInstance.post(`/students/${user.id}/book/${id}`,{
        requestDate:requestDate,
        mode:mode,
      });
      setBookMsg('✓ Booking request sent! The tutor will confirm shortly.');
      setRequestDate('');
      setMode('');
    } catch (e) {
      setBookErr(e.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!rating) { setRevErr('Please select a rating.'); return; }
    setRevMsg(''); setRevErr('');
    try {
      await axiosInstance.post('/reviews', {
        studentId: user.id,
        tutorId:   Number(id),
        rating,
        comment,
      });
      setRevMsg('✓ Review submitted! Thank you.');
      setRating(0); setComment('');
      // Reload reviews
      const res = await axiosInstance.get(`/reviews/tutor/${id}`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setRevErr(e.response?.data?.error || 'Failed to submit review.');
    }
  };

  if (loading) return (
    <div className="tpr-page">
      <div className="tpr-skeleton-wrap">
        <div className="tpr-sk tpr-sk-avatar" />
        <div className="tpr-sk tpr-sk-lg" />
        <div className="tpr-sk tpr-sk-md" />
        <div className="tpr-sk tpr-sk-sm" />
        <div className="tpr-sk tpr-sk-full" />
      </div>
    </div>
  );

  if (error || !tutor) return (
    <div className="tpr-page">
      <div className="tpr-error">
        <span>😕</span>
        <p>{error || 'Tutor not found.'}</p>
        <Link to="/tutors" className="btn-primary">← Back to Tutors</Link>
      </div>
    </div>
  );

  const color = getColor(id);

  return (
    <div className="tpr-page">
      {/* Hero */}
      <section className="tpr-hero" style={{ '--accent': color }}>
        <div className="page-wrapper tpr-hero-inner">

          <div className="tpr-hero-text">
            <div className="tpr-avatar" style={{ background: color }}>
            {getInitials(tutor.name)}
          </div>
            <p className="tpr-hero-tag">Tutor Profile</p>
            <h1 className="tpr-hero-name">{tutor.name || 'Unknown'}</h1>
            {tutor.subject && <p className="tpr-hero-subject">{tutor.subject}</p>}
          </div>
          <div>
          {isStudent && (
          <div className=" tpr-book-card tpr-card ">
            <h2 className="tpr-card-title">📅 Book a Session</h2>

            {bookMsg && (
              <div className="tpr-alert tpr-alert-success">
                <span className="tpr-alert-icon">✓</span>
                <span>{bookMsg}</span>
              </div>
            )}
            {bookErr && (
              <div className="tpr-alert tpr-alert-error">
                <span className="tpr-alert-icon">!</span>
                <span>{bookErr}</span>
              </div>
            )}

            <form className="tpr-book-form" onSubmit={handleBook} noValidate>
              <div className="tpr-form-group">
                <label className="tpr-form-label" htmlFor="requestDate">
                  📆 Request Date
                </label>
                <input
                  id="requestDate"
                  type="date"
                  className="tpr-form-input"
                  value={requestDate}
                  onChange={e => setRequestDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="tpr-form-group">
                <label className="tpr-form-label" htmlFor="bookingMode">
                  🎓 Mode
                </label>
                <input
                  id="bookingMode"
                  type="text"
                  className="tpr-form-input"
                  placeholder="e.g. Online, In-person, Hybrid…"
                  value={mode}
                  onChange={e => setMode(e.target.value)}
                  required
                />
              </div>

              <div className="tpr-book-footer">
                <button type="submit" className="btn-primary" disabled={booking}>
                  {booking ? <span className="spinner" /> : '🚀 Send Booking Request'}
                </button>
                <Link to="/tutors" className="btn-secondary tpr-back-link">← Back to Tutors</Link>
              </div>
            </form>
          </div>
          )}</div>
        </div>
      </section>

      {/* Main content */}
      <section className="page-wrapper tpr-content">
        <div className="tpr-body-card">
          
          <div className="tpr-body-section">
            <h2 className="tpr-body-title">About the Tutor</h2>
            <p className="tpr-bio">{tutor.bio || 'No bio provided by this tutor.'}</p>
          </div>

          <div className="tpr-body-section">
            <h2 className="tpr-body-title">Details & Pricing</h2>
            <div className="tpr-info-grid">
              <InfoRow icon="📚" label="Subject"          value={tutor.subject} />
              <InfoRow icon="💰" label="Hourly Rate"      value={tutor.hourlyRate != null ? `Rs. ${tutor.hourlyRate}` : null} />
              <InfoRow icon="⭐" label="Average Rating"   value={tutor.averageRating != null ? `${Number(tutor.averageRating).toFixed(1)} / 5` : null} />
              <InfoRow icon="✉️" label="Email"            value={tutor.email} />
            </div>
          </div>

          {/* Leave a Review — only for logged-in students */}
          {isStudent && !bookMsg.includes('✓') && (
            <div className="tpr-body-section">
              <h2 className="tpr-body-title">Leave a Review</h2>
              {revMsg && <p style={{ color:'#00bfa5', marginBottom:'0.75rem', fontWeight:'600' }}>{revMsg}</p>}
              {revErr && <p style={{ color:'#ef4444', marginBottom:'0.75rem', fontWeight:'600' }}>{revErr}</p>}
              <form className="tpr-review-form" onSubmit={handleReview}>
                <div className="tpr-rating-stars">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button"
                      className={`tpr-star-btn ${n <= rating ? 'active' : 'inactive'}`}
                      onClick={() => setRating(n)}>
                      ★
                    </button>
                  ))}
                </div>
                <textarea placeholder="Share your experience…"
                  value={comment} onChange={e => setComment(e.target.value)} required />
                <button type="submit" className="btn-primary" style={{ alignSelf:'flex-start' }}>
                  Submit Review
                </button>
              </form>
            </div>
          )}

          {/* Existing reviews */}
          {reviews.length > 0 && (
            <div className="tpr-body-section">
              <h2 className="tpr-body-title">Student Reviews</h2>
              <div className="tpr-review-list">
                {reviews.map(r => (
                  <div key={r.id} className="tpr-review-item">
                    <div className="tpr-review-header">
                      <span className="tpr-review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                      <span className="tpr-review-author">— {r.studentName || 'Student'}</span>
                    </div>
                    <p className="tpr-review-comment">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
