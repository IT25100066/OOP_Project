import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import './LoginPage.css';

/*
 * LoginPage — sends username + password to POST /api/auth/login
 * The backend returns { id, name, username, email, role }
 * We pass that to login() which stores it in localStorage.
 */
export default function LoginPage() {
  const { login } = useAuth();

  const [form, setForm]       = useState({ username: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      // POST /api/auth/login — backend accepts {username, password}
      const res = await axiosInstance.post('/auth/login', {
        username: form.username,
        password: form.password,
      });
      // res.data = { id, name, username, email, role }
      login(res.data.user , res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-page">
      <div className="lp-blob lp-blob-1" />
      <div className="lp-blob lp-blob-2" />

      <div className="lp-card">
        {/* Header */}
        <div className="lp-header">
          <div className="lp-logo">🎓</div>
          <h1 className="lp-title">Welcome Back</h1>
          <p className="lp-subtitle">Sign in to continue your learning journey</p>
        </div>

        {/* Form */}
        <form className="lp-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="error-banner"><span>⚠</span>{error}</div>}

          <div className="lp-field">
            <label htmlFor="lp-username">Username</label>
            <input
              id="lp-username" type="text" name="username"
              placeholder="your_username"
              value={form.username} onChange={handleChange}
              autoComplete="username"
            />
          </div>

          <div className="lp-field">
            <label htmlFor="lp-password">Password</label>
            <div className="lp-pw-wrap">
              <input
                id="lp-password" type={showPw ? 'text' : 'password'} name="password"
                placeholder="••••••••" value={form.password} onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button" className="lp-eye"
                onClick={() => setShowPw(p => !p)}
                aria-label={showPw ? 'Hide' : 'Show'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <p className="lp-back">
            <Link to="/ForgetPassword" className="lp-link">← Forgot Password</Link>
          </p>

          <button type="submit" className="btn-primary lp-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        {/* Links */}
        <p className="lp-footer">
          New tutor?{' '}
          <Link to="/register-tutor" className="lp-link">Register as Tutor</Link>
        </p>
        <p className="lp-footer">
          New student?{' '}
          <Link to="/student-register" className="lp-link">Register as Student</Link>
        </p>
        <p className="lp-back">
          <Link to="/" className="lp-link">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
