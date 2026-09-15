import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import './RegisterTutor.css';

/*
 * RegisterTutor — sends tutor registration to POST /api/auth/register/tutor
 * Backend accepts: { name, username, email, password, subject, hourlyRate, bio }
 */
const initial = {
  name: '', username: '', email: '', password: '', confirmPassword: '',
  subject: '', hourlyRate: '', bio: '',
};

function validate(form) {
  if (!form.name.trim())                                      return 'Full name is required.';
  if (!form.username.trim())                                  return 'Username is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))       return 'Please enter a valid email address.';
  if (!form.subject.trim())                                   return 'Subject specialisation is required.';
  if (!form.hourlyRate || isNaN(form.hourlyRate) || Number(form.hourlyRate) <= 0)
                                                              return 'Please enter a valid hourly rate.';
  if (form.password.length < 6)                              return 'Password must be at least 6 characters.';
  if (form.password !== form.confirmPassword)                return 'Passwords do not match.';
  return null;
}

export default function RegisterTutor() {
  const [form, setForm]       = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp]                 = useState('');

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const err = validate(form);
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await axiosInstance.post('/auth/send-2fa-code', { email: form.email.trim() });
      setShowOtpForm(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send 2FA code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { setError('Please enter the 6-digit OTP.'); return; }
    setLoading(true);
    try {
      // POST /api/auth/register/tutor — match backend's expected fields
      await axiosInstance.post('/auth/register/tutor', {
        name:       form.name.trim(),
        username:   form.username.trim(),
        email:      form.email.trim(),
        password:   form.password,
        subject:    form.subject.trim(),
        hourlyRate: Number(form.hourlyRate),
        bio:        form.bio.trim(),
        otp:        otp.trim()
      });
      setSuccess(true);
      setForm(initial);
      setOtp('');
      setShowOtpForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Check OTP or username.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="rt-page">
      <div className="rt-success glass-card">
        <div className="rt-success-icon">✓</div>
        <h2>Registration Successful!</h2>
        <p>Welcome aboard! Your tutor profile has been created. You can now log in.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/login" className="btn-primary">Sign In →</Link>
          <button className="btn-secondary" onClick={() => setSuccess(false)}>Register Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rt-page">
      <div className="rt-container">
        <div className="rt-header">
          <span className="rt-badge">Tutor Registration</span>
          <h1 className="rt-title">Join Our Teaching Network</h1>
          <p className="rt-subtitle">Register as a tutor and connect with students.</p>
        </div>

        {!showOtpForm ? (
        <form className="rt-card glass-card" onSubmit={handleRequestOtp} noValidate>

          {/* 01 – Personal Info */}
          <section className="rt-section">
            <h2 className="rt-section-title"><span className="rt-step">01</span> Personal Information</h2>
            <div className="rt-grid-2">
              <div className="rt-field">
                <label htmlFor="name">Full Name <span className="rt-req">*</span></label>
                <input id="name" name="name" placeholder="e.g. Alex Johnson"
                  value={form.name} onChange={handleChange} required />
              </div>
              <div className="rt-field">
                <label htmlFor="username">Username <span className="rt-req">*</span></label>
                <input id="username" name="username" placeholder="e.g. alexj"
                  value={form.username} onChange={handleChange} required />
              </div>
              <div className="rt-field">
                <label htmlFor="email">Email Address <span className="rt-req">*</span></label>
                <input id="email" name="email" type="email" placeholder="alex@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>
            </div>
          </section>

          <div className="rt-divider" />

          {/* 02 – Professional */}
          <section className="rt-section">
            <h2 className="rt-section-title"><span className="rt-step">02</span> Professional Details</h2>
            <div className="rt-grid-2">
              <div className="rt-field">
                <label htmlFor="subject">Subject <span className="rt-req">*</span></label>
                <input id="subject" name="subject" placeholder="e.g. Mathematics"
                  value={form.subject} onChange={handleChange} required />
              </div>
              <div className="rt-field">
                <label htmlFor="hourlyRate">Hourly Rate (Rs.) <span className="rt-req">*</span></label>
                <input id="hourlyRate" name="hourlyRate" type="number" min="1"
                  placeholder="e.g. 500" value={form.hourlyRate} onChange={handleChange} required />
              </div>
            </div>
            <div className="rt-field">
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" name="bio" rows={3}
                placeholder="Describe your teaching style…"
                value={form.bio} onChange={handleChange} />
            </div>
          </section>

          <div className="rt-divider" />

          {/* 03 – Account */}
          <section className="rt-section">
            <h2 className="rt-section-title"><span className="rt-step">03</span> Account Security</h2>
            <div className="rt-grid-2">
              <div className="rt-field">
                <label htmlFor="password">Password <span className="rt-req">*</span></label>
                <input id="password" name="password" type="password"
                  placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
              </div>
              <div className="rt-field">
                <label htmlFor="confirmPassword">Confirm Password <span className="rt-req">*</span></label>
                <input id="confirmPassword" name="confirmPassword" type="password"
                  placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </div>
          </section>

          {error && <div className="error-banner"><span>!</span>{error}</div>}

          <div className="rt-actions">
            <button type="button" className="btn-secondary"
              onClick={() => { setForm(initial); setError(''); }} disabled={loading}>
              Clear Form
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Register as Tutor'}
            </button>
          </div>

          <p style={{ textAlign:'center', marginTop: '1rem', fontSize:'0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color:'var(--accent)' }}>Sign in</Link>
          </p>
        </form>
        ) : (
          <form className="rt-card glass-card" onSubmit={handleVerifyAndRegister} noValidate>
            <h2 className="rt-section-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Verify Email</h2>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-color)' }}>
              We've sent a 6-digit code to <strong style={{ color: 'var(--accent)' }}>{form.email}</strong>.
            </p>
            <div className="rt-field" style={{ maxWidth: '300px', margin: '0 auto' }}>
              <label htmlFor="otp">Verification Code <span className="rt-req">*</span></label>
              <input id="otp" name="otp" placeholder="Enter 6-digit code"
                value={otp} onChange={(e) => { setOtp(e.target.value); setError(''); }} required 
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.4rem', padding: '1rem' }}
                maxLength={6}
              />
            </div>
            {error && <div className="error-banner" style={{ marginTop: '1.5rem' }}><span>!</span>{error}</div>}
            <div className="rt-actions" style={{ marginTop: '2rem' }}>
              <button type="button" className="btn-secondary"
                onClick={() => { setShowOtpForm(false); setError(''); }} disabled={loading}>
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Verify & Register'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
