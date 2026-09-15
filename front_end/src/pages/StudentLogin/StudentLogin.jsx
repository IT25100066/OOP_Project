import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import './StudentLogin.css';

export default function StudentLogin() {
  const { login } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
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
    <div className="slp-page">
      <div className="slp-blob slp-blob-1" />
      <div className="slp-blob slp-blob-2" />

      <div className="slp-card glass-card">
        {/* Header */}
        <div className="slp-header">
          <div className="slp-logo">🎒</div>
          <h1 className="slp-title">Student Login</h1>
          <p className="slp-subtitle">Welcome back! Ready to learn?</p>
        </div>

        {/* Form */}
        <form className="slp-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="error-banner"><span>⚠</span>{error}</div>}

          <div className="slp-field">
            <label htmlFor="slp-username">Username</label>
            <input id="slp-username" type="text" name="username" placeholder="student_username"
              value={form.username} onChange={handleChange} autoComplete="username" />
          </div>

          <div className="slp-field">
            <label htmlFor="slp-password">Password</label>
            <div className="slp-pw-wrap">
              <input id="slp-password" type={showPw ? 'text' : 'password'} name="password"
                placeholder="••••••••" value={form.password} onChange={handleChange}
                autoComplete="current-password" />
              <button type="button" className="slp-eye" onClick={() => setShowPw(p => !p)}
                aria-label={showPw ? 'Hide' : 'Show'}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="slp-forgot">
            <Link to="#" className="slp-link">Forgot password?</Link>
          </div>

          <button type="submit" className="btn-primary slp-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Log In'}
          </button>
        </form>

        <p className="slp-footer">
          Don't have an account?{' '}
          <Link to="/student-register" className="slp-link">Register as Student</Link>
        </p>
        <p className="slp-back">
          <Link to="/" className="slp-link">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
