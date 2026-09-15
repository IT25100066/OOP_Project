import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import './RegisterAdmin.css';

const initial = {
  name: '', username: '', email: '', password: '', confirmPassword: '', secretKey: ''
};

function validate(form) {
  if (!form.name.trim())                                      return 'Full name is required.';
  if (!form.username.trim())                                  return 'Username is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))         return 'Please enter a valid email address.';
  if (form.password.length < 6)                               return 'Password must be at least 6 characters.';
  if (form.password !== form.confirmPassword)                 return 'Passwords do not match.';
  if (!form.secretKey.trim())                                 return 'Secret Key is required.';
  return null;
}

export default function RegisterAdmin() {
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
      await axiosInstance.post('/auth/register/admin', {
        name:     form.name.trim(),
        username: form.username.trim(),
        email:    form.email.trim(),
        password: form.password,
        secretKey: form.secretKey.trim(),
        otp:      otp.trim()
      });
      setSuccess(true);
      setForm(initial);
      setOtp('');
      setShowOtpForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Check credentials, secret key, or OTP.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="ra-page">
      <div className="ra-blob ra-blob-1" />
      <div className="ra-blob ra-blob-2" />
      <div className="ra-success glass-card">
        <div className="ra-success-icon">🎉</div>
        <h2>Registration Successful!</h2>
        <p>Welcome! Your admin account has been created. You can now log in.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn-primary">Sign In →</Link>
          <button className="btn-secondary" onClick={() => setSuccess(false)}>Register Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ra-page">
      <div className="ra-blob ra-blob-1" />
      <div className="ra-blob ra-blob-2" />

      <div className="ra-container">
        <div className="ra-header">
          <span className="ra-badge">🛡️ Admin Registration</span>
          <h1 className="ra-title">Create System Admin Account</h1>
          <p className="ra-subtitle">Restricted area: Requires valid system secret key.</p>
        </div>

        {!showOtpForm ? (
        <form className="ra-card glass-card" onSubmit={handleRequestOtp} noValidate>

          {/* 01 – Personal Info */}
          <section className="ra-section">
            <h2 className="ra-section-title">
              <span className="ra-step">01</span> Personal Information
            </h2>
            <div className="ra-grid-2">
              <div className="ra-field">
                <label htmlFor="ra-name">Full Name <span className="ra-req">*</span></label>
                <input id="ra-name" name="name" placeholder="e.g. John Doe"
                  value={form.name} onChange={handleChange} required />
              </div>
              <div className="ra-field">
                <label htmlFor="ra-username">Username <span className="ra-req">*</span></label>
                <input id="ra-username" name="username" placeholder="e.g. admin_john"
                  value={form.username} onChange={handleChange} required />
              </div>
              <div className="ra-field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="ra-email">Email Address <span className="ra-req">*</span></label>
                <input id="ra-email" name="email" type="email" placeholder="admin@system.com"
                  value={form.email} onChange={handleChange} required />
              </div>
            </div>
          </section>

          <div className="ra-divider" />

          {/* 02 – Account Security */}
          <section className="ra-section">
            <h2 className="ra-section-title">
              <span className="ra-step">02</span> Account Security
            </h2>
            <div className="ra-grid-2">
              <div className="ra-field">
                <label htmlFor="ra-password">Password <span className="ra-req">*</span></label>
                <div className="ra-pw-wrap">
                  <input id="ra-password" name="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password} onChange={handleChange} required />
                  <button type="button" className="ra-eye"
                    onClick={() => setShowPw(p => !p)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="ra-field">
                <label htmlFor="ra-confirmPw">Confirm Password <span className="ra-req">*</span></label>
                <div className="ra-pw-wrap">
                  <input id="ra-confirmPw" name="confirmPassword"
                    type={showCPw ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={form.confirmPassword} onChange={handleChange} required />
                  <button type="button" className="ra-eye"
                    onClick={() => setShowCPw(p => !p)}
                    aria-label={showCPw ? 'Hide password' : 'Show password'}>
                    {showCPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>
          </section>
          
          <div className="ra-divider" />

          {/* 03 – System Authorization */}
          <section className="ra-section">
            <h2 className="ra-section-title">
              <span className="ra-step">03</span> System Authorization
            </h2>
            <div className="ra-grid-2">
              <div className="ra-field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="ra-secretKey">Admin Secret Key <span className="ra-req">*</span></label>
                <input id="ra-secretKey" name="secretKey" type="password" placeholder="Enter the system secret key"
                  value={form.secretKey} onChange={handleChange} required />
              </div>
            </div>
          </section>

          {error && <div className="error-banner"><span>⚠</span>{error}</div>}

          <div className="ra-actions">
            <button type="button" className="btn-secondary"
              onClick={() => { setForm(initial); setError(''); }} disabled={loading}>
              Clear Form
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Admin Account'}
            </button>
          </div>

          <p className="ra-footer">
            Already have an account?{' '}
            <Link to="/login" className="ra-link">Sign in here</Link>
          </p>
        </form>
        ) : (
          <form className="ra-card glass-card" onSubmit={handleVerifyAndRegister} noValidate>
            <h2 className="ra-section-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Verify Email</h2>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-color)' }}>
              We've sent a 6-digit code to <strong style={{ color: 'var(--accent)' }}>{form.email}</strong>.
            </p>
            <div className="ra-field" style={{ maxWidth: '300px', margin: '0 auto' }}>
              <label htmlFor="otp">Verification Code <span className="ra-req">*</span></label>
              <input id="otp" name="otp" placeholder="Enter 6-digit code"
                value={otp} onChange={(e) => { setOtp(e.target.value); setError(''); }} required 
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.4rem', padding: '1rem' }}
                maxLength={6}
              />
            </div>
            {error && <div className="error-banner" style={{ marginTop: '1.5rem' }}><span>⚠</span>{error}</div>}
            <div className="ra-actions" style={{ marginTop: '2rem' }}>
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
