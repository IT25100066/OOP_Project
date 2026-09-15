import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Support.css';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

// Static data like FAQs can safely live outside the component to prevent recreation on every render
const faqs = [
  { q: 'How do I register as a tutor?',      a: 'Click "Register" in the Navbar or visit /register-tutor. Fill in your personal and professional details, create a password, and submit.' },
  { q: 'Is my information secure?',            a: 'Absolutely. Passwords are hashed with BCrypt and never stored in plain text. API access is secure and protected.' },
  { q: 'Can I update my tutor profile?',       a: 'Yes. Once logged in, visit your Dashboard and click "Update Profile" to modify your details.' },
  { q: 'How does the search work?',            a: 'On the Tutors page you can search by name or subject in real time. More advanced filters are coming soon.' },
  { q: 'I forgot my password. What do I do?', a: 'Use the "Forgot password?" link on the Login page. Password reset via email is coming in a future release.' },
];

export default function Support() {
  const { user } = useAuth();
  // State and Handlers MUST be inside the component
  const [formData, setFormData] = useState({
    email: '',
    contactNo: '',
    message: '',
    sender: user || null,
    token:''

  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('Submitting...');

    try {

        setFormData({token : localStorage.getItem('htss_token') })
      // Using your custom axiosInstance
      await axiosInstance.post('/contact', formData);
      
      setStatus('success');
      setFormData({ email: '', contactNo: '', message: '', sender: user || null }); // Clear form on success
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sup-page">
      <section className="sup-hero">
        <div className="page-wrapper">
          <span className="sup-badge">Help Centre</span>
          <h1>How Can We <span className="gradient-text">Help You?</span></h1>
          <p>Browse our frequently asked questions or get in touch with our support team.</p>
        </div>
      </section>

      <div className="page-wrapper sup-body">
        {/* FAQs */}
        <section className="sup-faqs">
          <h2>Frequently Asked Questions</h2>
          <div className="sup-faq-list">
            {faqs.map(({ q, a }) => (
              <details key={q} className="sup-faq glass-card">
                <summary className="sup-faq-q">{q}</summary>
                <p className="sup-faq-a">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="sup-contact glass-card">
          <div className="sup-contact-info">
            <h2>Still need help?</h2>
            <p>Our support team is available Monday – Friday, 9am – 6pm.</p>
            <div className="sup-links">
              <a href="mailto:support@hometutor.com" className="sup-link">📧 support@hometutor.com</a>
              <a href="tel:+919876543210"            className="sup-link">📞 +91 98765 43210</a>
            </div>
          </div>
          <div className="sup-links">
            <Link to="/register-tutor" className="btn-primary">Register as Tutor →</Link>
            <Link to="/admin-register" className="btn-primary">Register as Admin →</Link>
            <Link to="/student-register" className="btn-primary">Register as Student →</Link>
          </div>
        </section>
      </div>

      <div className="theme-wrapper">
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Get in Touch</h2>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={user?.email}
              onChange={handleChange}
              placeholder="hello@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactNo">Contact Number</label>
            <input
              type="tel"
              id="contactNo"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="How can we help you?"
              rows="5"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>

          {/* Status Messages */}
          {status === 'success' && (
            <p className="status-msg success">Message sent successfully!</p>
          )}
          {status === 'error' && (
            <p className="status-msg error">Failed to send. Please try again later.</p>
          )}
        </form>
      </div>
    </div>
  );
}