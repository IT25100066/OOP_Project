import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

/*
 * Dashboard — role-based content:
 *
 * STUDENT → shows their bookings (GET /api/students/:id/bookings)
 * TUTOR   → shows incoming booking requests with Accept / Reject buttons
 *            (GET /api/tutors/my-bookings?userId=:id)
 *            (PUT /api/tutors/bookings/:bookingId/status)
 * ADMIN   → shows all bookings (GET /api/admin/bookings)
 */
export default function Dashboard() {
  const { user, logout, isStudent, isTutor, isAdmin } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [actionMsg, setActionMsg] = useState(''); // success/fail message for tutor actions

  // Profile Edit State
  const [tutorProfile, setTutorProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ subject: '', bio: '', hourlyRate: '' });
  const [profileMsg, setProfileMsg] = useState('');

  // Fetch tutor profile on load
  useEffect(() => {
    if (isTutor && user) {
      axiosInstance.get('/tutors').then(res => {
        const myProfile = res.data.find(t => Number(t.userId) === Number(user.id));
        if (myProfile) {
          setTutorProfile(myProfile);
          setEditForm({
            subject: myProfile.subject || '',
            bio: myProfile.bio || '',
            hourlyRate: myProfile.hourlyRate || ''
          });
        }
      }).catch(console.error);
    }
  }, [isTutor, user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/tutors/${tutorProfile.id}`, editForm);
      setTutorProfile({ ...tutorProfile, ...editForm });
      setIsEditingProfile(false);
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileMsg('Failed to update profile.');
      setTimeout(() => setProfileMsg(''), 3000);
    }
  };

  // Load bookings based on role
  const loadBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let res;
      if (isStudent) {
        res = await axiosInstance.get(`/students/${user.id}/bookings`);
      } else if (isTutor) {
        res = await axiosInstance.get(`/tutors/my-bookings?userId=${user.id}`);
      } else if (isAdmin) {
        res = await axiosInstance.get('/admin/bookings');
      }
      setBookings(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user, isStudent, isTutor, isAdmin]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  // Status badge colour
  const statusColor = (s) => ({
    PENDING:   '#f59e0b',
    CONFIRMED: '#3b82f6',
    COMPLETED: '#10b981',
    CANCELLED: '#ef4444',
  }[s] || '#888');

  // Called when tutor clicks Accept or Reject
  const handleBookingAction = async (bookingId, newStatus) => {
    try {
      await axiosInstance.put(`/tutors/bookings/${bookingId}/status`, {
        status: newStatus,
      });
      setActionMsg(`Booking #${bookingId} marked as ${newStatus}.`);
      // Reload to reflect the change
      loadBookings();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) {
      setActionMsg(e.response?.data?.error || 'Failed to update booking status.');
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

const handleDelete = async (id) => {

  if (!window.confirm('Are you sure you want to delete this booking?')) return;

  try {

    await axiosInstance.delete(`/admin/bookings/${id}`);
    setError('');
    flashSuccess('Booking deleted successfully.');
    setData(prev => prev.filter(booking => booking.id !== id));
    setTimeout(() => setSuccess(''), 3000);
  } catch (err) {
    console.error('Delete Error:', err);
    const message = err.response?.data?.message || 'Failed to delete booking.';
    flashError(message);
    setTimeout(() => setError(''), 5000);
  }
};

  return (
    <div className="dash">
      {/* Header */}
      <div className="dash__hero">
        <div className="page-wrapper dash__hero-inner">
          <div className="dash__avatar">{(user?.name || '?').charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="dash__greeting">Welcome back, {user?.name || 'User'}! 👋</h1>
            <p className="dash__email">{user?.email} · <strong>{user?.role}</strong></p>
          </div>
          <button onClick={logout} className="btn-secondary dash__logout">Logout</button>
        </div>
      </div>

      <div className="page-wrapper dash__body">

        {/* Quick Actions */}
        <div className="dash__section">
          <h2 className="dash__section-title">Quick Actions</h2>
          <div className="dash__actions">
            <Link to="/tutors"   className="dash__action glass-card"><span>🔍</span><span>Browse Tutors</span></Link>
            {isStudent && <Link to="/tutors" className="dash__action glass-card"><span>📅</span><span>Book a Tutor</span></Link>}
            {isAdmin   && <Link to="/admin"  className="dash__action glass-card"><span>⚙️</span><span>Admin Panel</span></Link>}
            <Link to="/support"  className="dash__action glass-card"><span>💬</span><span>Get Support</span></Link>
            <Link to="/students" className="dash__action glass-card"><span>🎒</span><span>Student Hub</span></Link>


          </div>
        </div>

        {/* ---- TUTOR: My Profile ---- */}
        {isTutor && tutorProfile && (
          <div className="dash__section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="dash__section-title" style={{ margin: 0 }}>My Profile</h2>
              {!isEditingProfile && (
                <button className="btn-secondary" onClick={() => setIsEditingProfile(true)} style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✎</span> Edit Profile
                </button>
              )}
            </div>
            {profileMsg && (
              <div className={profileMsg.includes('Failed') ? 'error-banner' : 'success-banner'} style={{ marginBottom: '1rem' }}>
                {profileMsg}
              </div>
            )}

            {isEditingProfile ? (
              <form className="glass-card dash__profile-card" onSubmit={handleProfileUpdate}>
                <div className="dash__profile-grid">
                  <div className="dash__form-group">
                    <label>Subject</label>
                    <input type="text" className="dash__form-input" value={editForm.subject} onChange={e => setEditForm({...editForm, subject: e.target.value})} placeholder="e.g. Mathematics" required />
                  </div>
                  <div className="dash__form-group">
                    <label>Hourly Rate (Rs.)</label>
                    <input type="number" className="dash__form-input" value={editForm.hourlyRate} onChange={e => setEditForm({...editForm, hourlyRate: e.target.value})} placeholder="e.g. 500" required />
                  </div>
                  <div className="dash__form-group dash__profile-bio">
                    <label>Bio</label>
                    <textarea className="dash__form-input" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows={4} placeholder="Tell students about yourself..." style={{ resize: 'vertical' }} required />
                  </div>
                </div>
                <div className="dash__profile-actions">
                  <button type="submit" className="btn-primary">Save Changes</button>
                  <button type="button" className="btn-secondary" onClick={() => {
                    setIsEditingProfile(false);
                    setEditForm({
                      subject: tutorProfile.subject || '',
                      bio: tutorProfile.bio || '',
                      hourlyRate: tutorProfile.hourlyRate || ''
                    });
                  }}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="glass-card dash__profile-card">
                <div className="dash__profile-info">
                  <div className="dash__profile-row">
                    <span className="dash__profile-label">Subject</span>
                    <span className="dash__profile-value">{tutorProfile.subject || <span style={{ opacity: 0.5 }}>Not set</span>}</span>
                  </div>
                  <div className="dash__profile-row">
                    <span className="dash__profile-label">Hourly Rate</span>
                    <span className="dash__profile-value">{tutorProfile.hourlyRate ? `Rs. ${tutorProfile.hourlyRate}` : <span style={{ opacity: 0.5 }}>Not set</span>}</span>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <span className="dash__profile-label" style={{ display: 'block', marginBottom: '8px' }}>Bio</span>
                    <div className="dash__profile-bio-box">
                      {tutorProfile.bio || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>No bio provided yet. Click 'Edit Profile' to write something about yourself.</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---- STUDENT: My Bookings ---- */}
        {isStudent && (
          <div className="dash__section">
            <h2 className="dash__section-title">My Bookings</h2>
            {loading ? (
              <p className="dash__loading">Loading…</p>
            ) : (
              <div className="dash__table-wrap glass-card">
                {bookings.length === 0 ? (
                  <p className="dash__empty">You have no bookings yet. <Link to="/tutors">Browse tutors →</Link></p>
                ) : (
                  <table className="dash__table">
                    <thead>
                      <tr><th>Tutor</th><th>Subject</th><th>Date</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td>{b.tutor?.name || '—'}</td>
                          <td><span className="dash__badge">{b.tutor?.subject || '—'}</span></td>
                          <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                          <td>
                            <span style={{ color: statusColor(b.status), fontWeight: 600 }}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* ---- TUTOR: Incoming Booking Requests ---- */}
        {isTutor && (
          <div className="dash__section">
            <h2 className="dash__section-title">Booking Requests</h2>
            {actionMsg && (
              <div className={actionMsg.toLowerCase().includes('failed') ? 'error-banner' : 'success-banner'}
                   style={{ marginBottom: '1rem' }}>
                {actionMsg}
              </div>
            )}
            {loading ? (
              <p className="dash__loading">Loading…</p>
            ) : (
              <div className="dash__table-wrap glass-card">
                {bookings.length === 0 ? (
                  <p className="dash__empty">No booking requests yet.</p>
                ) : (
                  <table className="dash__table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Date Booked</th>
                        <th>Date Requested</th>
                        <th>Mode</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td>#{b.id}</td>
                          <td>{b.student?.name || '—'}</td>
                          <td>{b.student?.email || '—'}</td>
                          <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                          <td>{new Date(b.requestDate).toLocaleDateString()}</td>
                          <td>{b.mode}</td>
                          <td>
                            <span style={{ color: statusColor(b.status), fontWeight: 600 }}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            {/* Only PENDING bookings can be accepted or rejected */}
                            {b.status === 'PENDING' ? (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  className="btn-primary"
                                  style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
                                  onClick={() => handleBookingAction(b.id, 'CONFIRMED')}
                                  title="Accept this booking">
                                  ✓ Accept
                                </button>
                                <button
                                  className="btn-secondary"
                                  style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem',
                                           border: '1px solid #ef4444', color: '#ef4444' }}
                                  onClick={() => handleBookingAction(b.id, 'CANCELLED')}
                                  title="Reject this booking">
                                  ✕ Reject
                                </button>
                              </div>
                            ) : b.status === 'CONFIRMED' ? (
                              <button
                                className="btn-secondary"
                                style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
                                onClick={() => handleBookingAction(b.id, 'COMPLETED')}
                                title="Mark as completed">
                                ✓ Complete
                              </button>
                            ) : (
                              <span style={{ color: '#aaa', fontSize: '0.85rem' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* ---- ADMIN: All Bookings ---- */}
        {isAdmin && (
          <div className="dash__section">
            <h2 className="dash__section-title">All Bookings</h2>
            {loading ? (
              <p className="dash__loading">Loading…</p>
            ) : (
              <div className="dash__table-wrap glass-card">
                <table className="dash__table">
                  <thead>
                    <tr><th>#</th><th>Student</th><th>Tutor</th><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td>#{b.id}</td>
                        <td>{b.student?.name || '—'}</td>
                        <td>{b.tutor?.name   || '—'}</td>
                        <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                        <td>
                          <span style={{ color: statusColor(b.status), fontWeight: 600 }}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                            <button
                               onClick={() => handleDelete(b.id)}
                               className="booking-btn-delete"
                               title="Delete Booking">
                                Delete
                            </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {bookings.length === 0 && (
                    <tfoot><tr><td colSpan="5" className="dash__empty">No bookings yet.</td></tr></tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
