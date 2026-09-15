import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
        <div className="video-background">
          <video autoPlay loop muted playsInline className="video-content">
            <source src="/vedio.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      {/* Hero */}
      <div className="content-overlay">
      <section className="home__hero ">
        <div className="home__hero-bg">
          <div className="home__orb home__orb--1" />
          <div className="home__orb home__orb--2" />
          <div className="home__orb home__orb--3" />
        </div>
        <div className="page-wrapper home__hero-content">
          <span className="home__badge">🎓 Home Tutor Search System</span>
          <h1 className="home__title">
            Find the <span className="gradient-text">Perfect Tutor</span><br />
            for Your Learning Journey
          </h1>
          <p className="home__subtitle">
            Connect with qualified, passionate educators who bring learning to life.
            Browse profiles, check qualifications, and start your growth today.
          </p>
          <div className="home__cta-group">
            <Link to="/tutors" className="btn-primary home__cta-main">
              Browse Tutors →
            </Link>
            {!isAuthenticated && (
              <Link to="/register-tutor" className="btn-secondary home__cta-sec">
                Become a Tutor
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/dashboard" className="btn-secondary home__cta-sec">
                My Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>
      </div>

      {/* Stats */}
      <section className="home__stats">
        <div className="page-wrapper home__stats-inner">
          {[
            { value: '500+', label: 'Qualified Tutors' },
            { value: '20+',  label: 'Subjects Covered' },
            { value: '98%',  label: 'Satisfaction Rate' },
            { value: '10k+', label: 'Sessions Delivered' },
          ].map(({ value, label }) => (
            <div key={label} className="home__stat">
              <span className="home__stat-value gradient-text">{value}</span>
              <span className="home__stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="home__features">
        <div className="page-wrapper">
          <div className="home__section-head">
            <h2>Why Choose <span className="gradient-text">HomeTutor?</span></h2>
            <p>Everything you need to find, connect, and learn.</p>
          </div>
          <div className="home__feature-grid">
            {[
              { icon: '🔍', title: 'Smart Search', desc: 'Find tutors by subject, qualification, and years of experience in seconds.' },
              { icon: '🔐', title: 'Verified Profiles', desc: 'Every tutor is registered with validated credentials and background checks.' },
              { icon: '⭐', title: 'Rated & Reviewed', desc: 'Transparent ratings and reviews help you make the best choice.' },
              { icon: '💬', title: 'Easy Booking', desc: 'Reach out directly to your chosen tutor and schedule your sessions effortlessly.' },
              { icon: '📱', title: 'Mobile Ready', desc: 'Use HomeTutor on any device — phone, tablet, or desktop.' },
              { icon: '🚀', title: 'Fast & Reliable', desc: 'Powered by Spring Boot and React for a smooth, responsive experience.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="home__feature glass-card">
                <span className="home__feature-icon">{icon}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="home__banner">
        <div className="page-wrapper home__banner-inner">
          <h2>Ready to Start Teaching?</h2>
          <p>Join our growing community of educators and make an impact.</p>
          <Link to="/register-tutor" className="btn-primary">Register as a Tutor →</Link>
        </div>
      </section>
    </div>
  );
}
