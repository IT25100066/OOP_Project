import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import './RegisterStudent.css';

/*
 * RegisterStudent — sends student registration to POST /api/auth/register/student
 * Backend User model: { name, username, email, password, role }
 */
const initial = {
  name: '', username: '', email: '', password: '', confirmPassword: '',
};

function validate(form) {
  if (!form.name.trim())                                      return 'Full name is required.';
  if (!form.username.trim())                                  return 'Username is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))       return 'Please enter a valid email address.';
  if (form.password.length < 6)                              return 'Password must be at least 6 characters.';
  if (form.password !== form.confirmPassword)                return 'Passwords do not match.';
  return null;
}

export default function RegisterStudent() {
  const [form, setForm]           = useState(initial);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [showCPw, setShowCPw]     = useState(false);

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
      // POST /api/auth/register/student — backend accepts {name, username, email, password, otp}
      await axiosInstance.post('/auth/register/student', {
        name:     form.name.trim(),
        username: form.username.trim(),
        email:    form.email.trim(),
        password: form.password,
        otp:      otp.trim()
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
    <div className="rs-page">
      <div className="rs-blob rs-blob-1" />
      <div className="rs-blob rs-blob-2" />
      <div className="rs-success glass-card">
        <div className="rs-success-icon">🎉</div>
        <h2>Registration Successful!</h2>
        <p>Welcome! Your student account has been created. You can now log in.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn-primary">Sign In →</Link>
          <button className="btn-secondary" onClick={() => setSuccess(false)}>Register Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rs-page">
      <div className="rs-blob rs-blob-1" />
      <div className="rs-blob rs-blob-2" />

      <div className="rs-container">
        <div className="rs-header">
          <span className="rs-badge">🎒 Student Registration</span>
          <h1 className="rs-title">Create Your Student Account</h1>
          <p className="rs-subtitle">Join our learning platform and connect with expert tutors.</p>
        </div>

        {!showOtpForm ? (
        <form className="rs-card glass-card" onSubmit={handleRequestOtp} noValidate>

          {/* 01 – Personal Info */}
          <section className="rs-section">
            <h2 className="rs-section-title">
              <span className="rs-step">01</span> Personal Information
            </h2>
            <div className="rs-grid-2">
              <div className="rs-field">
                <label htmlFor="rs-name">Full Name <span className="rs-req">*</span></label>
                <input id="rs-name" name="name" placeholder="e.g. Priya Sharma"
                  value={form.name} onChange={handleChange} required />
              </div>
              <div className="rs-field">
                <label htmlFor="rs-username">Username <span className="rs-req">*</span></label>
                <input id="rs-username" name="username" placeholder="e.g. priya_s"
                  value={form.username} onChange={handleChange} required />
              </div>
              <div className="rs-field">
                <label htmlFor="rs-email">Email Address <span className="rs-req">*</span></label>
                <input id="rs-email" name="email" type="email" placeholder="priya@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>
            </div>
          </section>

          <div className="rs-divider" />

          {/* 02 – Account Security */}
          <section className="rs-section">
            <h2 className="rs-section-title">
              <span className="rs-step">02</span> Account Security
            </h2>
            <div className="rs-grid-2">
              <div className="rs-field">
                <label htmlFor="rs-password">Password <span className="rs-req">*</span></label>
                <div className="rs-pw-wrap">
                  <input id="rs-password" name="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password} onChange={handleChange} required />
                  <button type="button" className="rs-eye"
                    onClick={() => setShowPw(p => !p)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="rs-field">
                <label htmlFor="rs-confirmPw">Confirm Password <span className="rs-req">*</span></label>
                <div className="rs-pw-wrap">
                  <input id="rs-confirmPw" name="confirmPassword"
                    type={showCPw ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={form.confirmPassword} onChange={handleChange} required />
                  <button type="button" className="rs-eye"
                    onClick={() => setShowCPw(p => !p)}
                    aria-label={showCPw ? 'Hide password' : 'Show password'}>
                    {showCPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {error && <div className="error-banner"><span>⚠</span>{error}</div>}

          <div className="rs-actions">
            <button type="button" className="btn-secondary"
              onClick={() => { setForm(initial); setError(''); }} disabled={loading}>
              Clear Form
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </div>

          <p className="rs-footer">
            Already have an account?{' '}
            <Link to="/login" className="rs-link">Sign in here</Link>
          </p>
        </form>
        ) : (
          <form className="rs-card glass-card" onSubmit={handleVerifyAndRegister} noValidate>
            <h2 className="rs-section-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Verify Email</h2>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-color)' }}>
              We've sent a 6-digit code to <strong style={{ color: 'var(--accent)' }}>{form.email}</strong>.
            </p>
            <div className="rs-field" style={{ maxWidth: '300px', margin: '0 auto' }}>
              <label htmlFor="otp">Verification Code <span className="rs-req">*</span></label>
              <input id="otp" name="otp" placeholder="Enter 6-digit code"
                value={otp} onChange={(e) => { setOtp(e.target.value); setError(''); }} required 
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.4rem', padding: '1rem' }}
                maxLength={6}
              />
            </div>
            {error && <div className="error-banner" style={{ marginTop: '1.5rem' }}><span>⚠</span>{error}</div>}
            <div className="rs-actions" style={{ marginTop: '2rem' }}>
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
