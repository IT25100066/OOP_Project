import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);


  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Brand */}
        <Link to="/" className="navbar__brand" onClick={close}>
          <span className="navbar__brand-icon">🎓</span>
          <span>Home<strong>Tutor</strong></span>
        </Link>

        {/* Desktop links */}
        <ul className="navbar__links">
          {[
            { to: '/',        label: 'Home',     end: true },
            { to: '/tutors',  label: 'Tutors' },
            { to: '/support', label: 'Support' },
            { to: '/students',label: 'Students' },
            isAdmin && { to: '/admin',   label: 'Admin' },
          ].filter(Boolean).map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="navbar__actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar__btn navbar__btn--ghost">Dashboard</Link>
              <button onClick={logout} className="navbar__btn navbar__btn--outline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"          className="navbar__btn navbar__btn--ghost">Login</Link>
              <Link to="/register-tutor" className="navbar__btn navbar__btn--primary">Register</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger ${open ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setOpen(p => !p)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`navbar__drawer ${open ? 'navbar__drawer--open' : ''}`}>
        <ul className="navbar__drawer-links">
          {[
            { to: '/',        label: 'Home',     end: true },
            { to: '/tutors',  label: 'Tutors' },
            { to: '/support', label: 'Support' },
            { to: '/students',label: 'Students' },
            isAdmin && { to: '/admin',   label: 'Admin' },
          ].filter(Boolean).map(({ to, label, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} onClick={close}
                className={({ isActive }) => isActive ? 'navbar__dlink navbar__dlink--active' : 'navbar__dlink'}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="navbar__drawer-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar__btn navbar__btn--ghost" onClick={close}>Dashboard</Link>
              <button onClick={() => { logout(); close(); }} className="navbar__btn navbar__btn--outline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"          className="navbar__btn navbar__btn--ghost"   onClick={close}>Login</Link>
              <Link to="/register-tutor" className="navbar__btn navbar__btn--primary" onClick={close}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
