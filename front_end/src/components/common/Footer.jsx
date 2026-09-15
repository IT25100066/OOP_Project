import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Footer.css';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function Footer() {
  const year = new Date().getFullYear();
  const { user } = useAuth();

  /* ── feedback state ─────────────────────────────────── */
  const [open, setOpen]               = useState(false);
  const [rating, setRating]           = useState(0);
  const [hovered, setHovered]         = useState(0);
  const [comment, setComment]         = useState('');
  const [reviewerName, setReviewerName]   = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [sent, setSent]               = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  function handleOpen() {
    setOpen(o => !o);
    setSent(false);
    setError('');
    // Pre-fill from logged-in user
    if (user) {
      setReviewerName(user.name  || '');
      setReviewerEmail(user.email || '');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) return;

    if (!reviewerName.trim() || !reviewerEmail.trim()) {
      setError('Please enter your name and email.');
      return;
    }

    if (!user) {
      setError('You must be logged in to submit feedback.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axiosInstance.post('/Appreviews/add', {
        userId:        user.id,
        rating,
        comment:       comment.trim(),
        reviewerName:  reviewerName.trim(),
        reviewerEmail: reviewerEmail.trim(),
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setOpen(false);
        setRating(0);
        setComment('');
        setReviewerName('');
        setReviewerEmail('');
      }, 2500);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to submit feedback. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="footer">
      <div className="page-wrapper footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">🎓 HomeTutor</span>
          <p>Connecting students with passionate educators across the country.</p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4>Platform</h4>
            <Link to="/tutors">Browse Tutors</Link>
            <Link to="/register-tutor">Become a Tutor</Link>
            <Link to="/login">Sign In</Link>
          </div>
          <div className="footer__col">
            <h4>Company</h4>
            <Link to="/support">Support</Link>
            <Link to="/students">Students</Link>
          </div>
        </div>

        {/* ── Feedback column ─────────────────────────── */}
        <div className="footer__col footer__feedback-col">
          <h4>Feedback</h4>
          <p className="footer__feedback-tagline">We'd love to hear from you!</p>
          <button
            className="footer__feedback-btn"
            onClick={handleOpen}
            aria-expanded={open}
          >
            {open ? 'Close ✕' : '💬 Give Feedback'}
          </button>

          {open && (
            <form className="footer__feedback-form" onSubmit={handleSubmit}>
              {sent ? (
                <p className="footer__feedback-thanks">🎉 Thanks for your feedback!</p>
              ) : (
                <>
                  {/* Reviewer info */}
                  <input
                    className="footer__feedback-input"
                    type="text"
                    placeholder="Your name"
                    value={reviewerName}
                    onChange={e => setReviewerName(e.target.value)}
                    required
                  />
                  <input
                    className="footer__feedback-input"
                    type="email"
                    placeholder="Your email"
                    value={reviewerEmail}
                    onChange={e => setReviewerEmail(e.target.value)}
                    required
                  />

                  {/* Star rating */}
                  <div className="footer__stars" role="group" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        className={`footer__star ${s <= (hovered || rating) ? 'footer__star--active' : ''}`}
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(0)}
                        aria-label={`${s} star${s > 1 ? 's' : ''}`}
                      >★</button>
                    ))}
                  </div>

                  <textarea
                    className="footer__feedback-text"
                    rows={3}
                    placeholder="Share your thoughts…"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />

                  {error && <p className="footer__feedback-error">{error}</p>}

                  <button
                    type="submit"
                    className="footer__feedback-submit"
                    disabled={!rating || loading}
                  >
                    {loading ? 'Submitting…' : 'Submit'}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {year} HomeTutor Search System.</p>
      </div>
    </footer>
  );
}
