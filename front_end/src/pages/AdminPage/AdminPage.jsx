import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './AdminPage.css';

/*
 * AdminPage — admin panel with three tabs: Tutors, Students & Bookings.
 *
 * Tutors tab:
 *   GET    /api/tutors         — load all tutors
 *   DELETE /api/tutors/{id}    — delete a tutor
 *
 * Students tab:
 *   GET    /api/admin/allStudents      — load all students
 *   DELETE /api/admin/student/{id}     — delete a student
 *
 * Bookings tab:
 *   GET    /api/admin/bookings                      — load all bookings
 *   PUT    /api/admin/bookings/{id}/status          — update booking status
 */

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const STATUS_COLORS = {
  PENDING:   { bg: 'rgba(255, 193, 7, 0.12)',  color: '#ffc107', border: 'rgba(255, 193, 7, 0.3)'  },
  CONFIRMED: { bg: 'rgba(40, 199, 111, 0.12)', color: '#28c76f', border: 'rgba(40, 199, 111, 0.3)' },
  COMPLETED: { bg: 'rgba(108, 99, 255, 0.12)', color: '#6c63ff', border: 'rgba(108, 99, 255, 0.3)' },
  CANCELLED: { bg: 'rgba(255, 107, 107, 0.12)',color: '#ff6b6b', border: 'rgba(255, 107, 107, 0.3)'},
  RESOLVED:  { bg: 'rgba(40, 199, 111, 0.12)', color: '#28c76f', border: 'rgba(40, 199, 111, 0.3)' }
};

const MASSAGE_STATUS_OPTIONS = ['PENDING', 'RESOLVED'];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('tutors'); // 'tutors' | 'students' | 'bookings'

  /* ── Tutors state ─────────────────────────────────── */
  const [tutors,       setTutors]       = useState([]);
  const [tutorLoading, setTutorLoading] = useState(true);

  /* ── Students state ───────────────────────────────── */
  const [students,       setStudents]       = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);

  /* ── Bookings state ───────────────────────────────── */
  const [bookings,       setBookings]       = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);
  const [updatingId,     setUpdatingId]     = useState(null); // id of booking being updated

  /* ── Messages state ───────────────────────────────── */
  const [massages,       setMassages]       = useState([]);
  const [massageLoading, setMassageLoading] = useState(false);
  const [massagesLoaded, setMassagesLoaded] = useState(false);
  const [updatingMassageId, setUpdatingMassageId] = useState(null);

  /* ── Shared feedback ──────────────────────────────── */
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const flashError   = (msg) => { setError(msg);   setTimeout(() => setError(''),   3500); };
  const flashSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); };

  /* ── Fetch tutors on mount ────────────────────────── */
  useEffect(() => { fetchTutors(); }, []);

  const fetchTutors = async () => {
    setTutorLoading(true);
    try {
      const res = await axiosInstance.get('/tutors');
      setTutors(Array.isArray(res.data) ? res.data : []);
    } catch {
      flashError('Failed to load tutors.');
    } finally {
      setTutorLoading(false);
    }
  };

  /* ── Fetch students (lazy — only when tab opened) ─── */
  const fetchStudents = async () => {
    setStudentLoading(true);
    try {
      const res = await axiosInstance.get('/admin/getStudents');
      setStudents(Array.isArray(res.data) ? res.data : []);
      setStudentsLoaded(true);
    } catch {
      flashError('Failed to load students.');
    } finally {
      setStudentLoading(false);
    }
  };

  /* ── Fetch bookings (lazy — only when tab opened) ─── */
  const fetchBookings = async () => {
    setBookingLoading(true);
    try {
      const res = await axiosInstance.get('/admin/bookings');
      setBookings(Array.isArray(res.data) ? res.data : []);
      setBookingsLoaded(true);
    } catch {
      flashError('Failed to load bookings.');
    } finally {
      setBookingLoading(false);
    }
  };

  /* ── Fetch messages (lazy — only when tab opened) ─── */
  const fetchMassages = async () => {
    setMassageLoading(true);
    try {
      const res = await axiosInstance.get('/contact/getAllMassages');
      setMassages(Array.isArray(res.data) ? res.data : []);
      setMassagesLoaded(true);
    } catch {
      flashError('Failed to load messages.');
    } finally {
      setMassageLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'students' && !studentsLoaded) fetchStudents();
    if (tab === 'bookings' && !bookingsLoaded) fetchBookings();
    if (tab === 'messages' && !massagesLoaded) fetchMassages();
  };

  /* ── Delete tutor ─────────────────────────────────── */
  const handleDeleteTutor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tutor?')) return;
    try {
      await axiosInstance.delete(`/tutors/${id}`);
      flashSuccess('Tutor deleted successfully.');
      setTutors(prev => prev.filter(t => t.id !== id));
    } catch {
      flashError('Failed to delete tutor.');
    }
  };

  /* ── Delete student ───────────────────────────────── */
  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await axiosInstance.delete(`/admin/students/${id}`);
      flashSuccess('Student deleted successfully.');
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch {
      flashError('Failed to delete student.');
    }
  };

  /* ── Delete massage ───────────────────────────────── */
  const handleDeleteMassage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this massage?')) return;
    try {
      await axiosInstance.delete(`/contact/${id}`);
      flashSuccess('Massage deleted successfully.');
      setMassages(prev => prev.filter(m => m.id !== id));
    } catch {
      flashError('Failed to delete massage.');
    }
  };

  /* ── Update booking status ────────────────────────── */
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await axiosInstance.put(`/admin/bookings/${bookingId}/status`, { status: newStatus });
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
      flashSuccess(`Booking #${bookingId} updated to ${newStatus}.`);
    } catch {
      flashError('Failed to update booking status.');
    } finally {
      setUpdatingId(null);
    }
  };

  /* ── Update message status ────────────────────────── */
  const handleUpdateMassageStatus = async (massageId, newStatus) => {
    setUpdatingMassageId(massageId);
    try {
      await axiosInstance.put(`/contact/${massageId}/status`, { status: newStatus });
      setMassages(prev =>
        prev.map(m => m.id === massageId ? { ...m, status: newStatus } : m)
      );
      flashSuccess(`Message #${massageId} updated to ${newStatus}.`);
    } catch {
      flashError('Failed to update message status.');
    } finally {
      setUpdatingMassageId(null);
    }
  };

  /* ── Status badge ─────────────────────────────────── */
  const StatusBadge = ({ status }) => {
    const s = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
    return (
      <span className="status-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
        {status}
      </span>
    );
  };

  return (
    <div className="admin-page">
      <div className="page-wrapper">
        {/* ── Header ── */}
        <header className="admin-header">
          <span className="admin-badge">Administration</span>
          <h1 className="admin-title">Admin <span className="gradient-text">Panel</span></h1>
          <p className="admin-subtitle">Manage tutors, students, and bookings registered in the system.</p>
        </header>

        {/* ── Feedback banners ── */}
        {error   && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        {/* ── Tab switcher ── */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn${activeTab === 'tutors' ? ' active' : ''}`}
            onClick={() => handleTabChange('tutors')}
          >
            🎓 Tutors
          </button>
          <button
            className={`admin-tab-btn${activeTab === 'students' ? ' active' : ''}`}
            onClick={() => handleTabChange('students')}
          >
            🎒 Students
          </button>
          <button
            className={`admin-tab-btn${activeTab === 'bookings' ? ' active' : ''}`}
            onClick={() => handleTabChange('bookings')}
          >
            📅 Bookings
          </button>
          <button
            className={`admin-tab-btn${activeTab === 'messages' ? ' active' : ''}`}
            onClick={() => handleTabChange('messages')}
          >
            📬 Messages
          </button>
        </div>

        <div className="admin-content">

          {/* ══════════════════════════════════════════
              TUTORS TAB
          ══════════════════════════════════════════ */}
          {activeTab === 'tutors' && (
            tutorLoading ? (
              <div className="admin-loading">
                <div className="spinner" />
                <span>Loading tutors…</span>
              </div>
            ) : (
              <div className="admin-table-wrap glass-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Rate (Rs.)</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutors.map(t => (
                      <tr key={t.id}>
                        <td>#{t.id}</td>
                        <td className="admin-name">{t.name || '—'}</td>
                        <td>{t.email || '—'}</td>
                        <td><span className="admin-subj-badge">{t.subject || 'N/A'}</span></td>
                        <td>{t.hourlyRate != null ? `Rs. ${t.hourlyRate}` : '—'}</td>
                        <td>{t.averageRating != null ? Number(t.averageRating).toFixed(1) : '—'}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteTutor(t.id)}
                            className="admin-btn-delete"
                            title="Delete Tutor">
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tutors.length === 0 && <div className="admin-empty">No tutors found.</div>}
              </div>
            )
          )}

          {/* ══════════════════════════════════════════
              STUDENTS TAB
          ══════════════════════════════════════════ */}
          {activeTab === 'students' && (
            studentLoading ? (
              <div className="admin-loading">
                <div className="spinner" />
                <span>Loading students…</span>
              </div>
            ) : (
              <div className="admin-table-wrap glass-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Username</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id}>
                        <td>#{s.id}</td>
                        <td className="admin-name">{s.name || '—'}</td>
                        <td>{s.email || '—'}</td>
                        <td>{s.username || '—'}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteStudent(s.id)}
                            className="admin-btn-delete"
                            title="Delete Student">
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {students.length === 0 && !studentLoading && (
                  <div className="admin-empty">No students found.</div>
                )}
              </div>
            )
          )}

          {/* ══════════════════════════════════════════
              BOOKINGS TAB
          ══════════════════════════════════════════ */}
          {activeTab === 'bookings' && (
            bookingLoading ? (
              <div className="admin-loading">
                <div className="spinner" />
                <span>Loading bookings…</span>
              </div>
            ) : (
              <div className="admin-table-wrap glass-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Student</th>
                      <th>Tutor</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td>#{b.id}</td>
                        <td>{b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : '—'}</td>
                        <td className="admin-name">{b.student?.name || '—'}</td>
                        <td>{b.tutor?.name || '—'}</td>
                        <td><span className="admin-subj-badge">{b.tutor?.subject || 'N/A'}</span></td>
                        <td><StatusBadge status={b.status} /></td>
                        <td>
                          <div className="status-select-wrap">
                            <select
                              className="status-select"
                              value={b.status}
                              disabled={updatingId === b.id}
                              onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                            >
                              {STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                            {updatingId === b.id && (
                              <span className="status-updating">⟳</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bookings.length === 0 && !bookingLoading && (
                  <div className="admin-empty">No bookings found.</div>
                )}
              </div>
            )
          )}

          {/* ══════════════════════════════════════════
              MESSAGES TAB
          ══════════════════════════════════════════ */}
          {activeTab === 'messages' && (
            massageLoading ? (
              <div className="admin-loading">
                <div className="spinner" />
                <span>Loading messages…</span>
              </div>
            ) : (
              <div className="admin-table-wrap glass-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Sender</th>
                      <th>Email</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Update Status</th>
                    
                    </tr>
                  </thead>
                 <tbody>
                   {massages.map((m) =>
                     m.status === "PENDING" ? (
                       <tr key={m.id}>
                         <td>#{m.id}</td>
                         <td>{m.timestamp ? new Date(m.timestamp).toLocaleDateString() : '—'}</td>
                         <td className="admin-name">{m.sender?.name || '—'}</td>
                         <td>{m.sender.email || '—' }</td>
                         <td style={{ maxWidth: 'auto', whiteSpace: 'wrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.message}>
                           {m.message || '—'}
                         </td>
                         <td><StatusBadge status={m.status} /></td>
                         <td>
                           <div className="status-select-wrap">
                             <select
                               className="status-select"
                               value={m.status}
                               disabled={updatingMassageId === m.id}
                               onChange={(e) => handleUpdateMassageStatus(m.id, e.target.value)}
                             >
                               {MASSAGE_STATUS_OPTIONS.map(opt => (
                                 <option key={opt} value={opt}>{opt}</option>
                               ))}
                             </select>
                             {updatingMassageId === m.id && (
                               <span className="status-updating">⟳</span>
                             )}
                           </div>
                         </td>
                         <td>

                             <button className="admin-btn-delete" onClick={() => handleDeleteMassage(m.id)}>
                               Delete
                             </button>
                         
                         </td>
                       </tr>
                     ) : null
                   )}
                 </tbody>
                </table>
                {massages.length === 0 && !massageLoading && (
                  <div className="admin-empty">No messages found.</div>
                )}
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}
