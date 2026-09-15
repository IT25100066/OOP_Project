import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Students.css';

const benefits = [
  { icon: '📚', title: 'Wide Subject Range',   desc: 'Find tutors across 20+ subjects from mathematics to literature.' },
  { icon: '⭐', title: 'Verified Tutors',       desc: 'Every tutor is background-checked and qualification-verified.' },
  { icon: '🕐', title: 'Flexible Scheduling',  desc: 'Book sessions that fit around your timetable and lifestyle.' },
  { icon: '💡', title: 'Personalised Learning', desc: 'One-on-one sessions tailored to your learning pace and goals.' },
];

export default function Students() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="stu-page">
      {/* Hero */}
      <section className="stu-hero">
        <div className="page-wrapper stu-hero-inner">
          <div className="stu-hero-text">
            <span className="stu-badge">Student Hub</span>
            <h1>Accelerate Your <span className="gradient-text">Learning</span></h1>
            <p>Connect with expert tutors handpicked for your subject, level, and goals. Learning has never been more personal.</p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <Link to="/tutors" className="btn-primary">Find a Tutor →</Link>
              {!isAuthenticated && <Link to="/student-register" className="btn-secondary">Student Register</Link>}
            </div>
          </div>
          <div className="stu-hero-cards">
            {['Mathematics', 'Physics', 'English', 'Chemistry'].map((subj, i) => (
              <div key={subj} className="stu-subj-pill glass-card" style={{ animationDelay: `${i * 0.1}s` }}>
                {subj}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="stu-benefits">
        <div className="page-wrapper">
          <h2 className="stu-section-title">Why Students Love <span className="gradient-text">HomeTutor</span></h2>
          <div className="stu-grid">
            {benefits.map(({ icon, title, desc }) => (
              <div key={title} className="stu-card glass-card">
                <span className="stu-icon">{icon}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="stu-cta">
        <div className="page-wrapper stu-cta-inner">
          <h2>Ready to start learning?</h2>
          <p>Explore all our available tutors and find the perfect match.</p>
          <Link to="/tutors" className="btn-primary">Browse Tutors →</Link>
        </div>
      </section>
    </div>
  );
}
