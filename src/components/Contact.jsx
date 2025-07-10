import { useState } from 'react';
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaExclamationTriangle,
  FaFacebook, FaTwitter, FaLinkedin, FaPaperPlane
} from 'react-icons/fa';
import '../components/styles/Contact.css';

const Contact = ({ setShowSuccessModal }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    subject: '',
    message: '',
    newsletter: false
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5051/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Your message has been sent successfully!');
        setShowSuccessModal(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          category: '',
          subject: '',
          message: '',
          newsletter: false
        });
      } else {
        alert('❌ Failed to send message: ' + data.msg);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('❌ An error occurred while sending your message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="contact" className="page">
      <div className="container">
        <h2 className="page-title">Contact AmaniLink Hub</h2>
        <p className="page-subtitle">Get in touch with our team or partner organizations</p>

        <div className="contact-container">
          <div className="contact-info">
            <div className="contact-card">
              <h3>Contact Information</h3>
              <div className="contact-item">
                <FaPhone />
                <div>
                  <strong>Phone</strong>
                  <p>+254 758 284 534</p>
                  <small>Available 24/7 for emergencies</small>
                </div>
              </div>
              <div className="contact-item">
                <FaEnvelope />
                <div>
                  <strong>Email</strong>
                  <p>bobwandati4@gmail.com</p>
                  <small>Response within 24 hours</small>
                </div>
              </div>
              <div className="contact-item">
                <FaMapMarkerAlt />
                <div>
                  <strong>Address</strong>
                  <p>Malindi, Kenya</p>
                  <small>Serving all of East Africa</small>
                </div>
              </div>
              <div className="contact-item">
                <FaClock />
                <div>
                  <strong>Office Hours</strong>
                  <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
                  <small>Emergency support available 24/7</small>
                </div>
              </div>
            </div>

            <div className="emergency-notice">
              <FaExclamationTriangle />
              <div>
                <h4>Emergency Situations</h4>
                <p>For immediate life-threatening emergencies:</p>
                <p><strong>Police:</strong> 999 or 112</p>
                <p><strong>USSD:</strong> *456*7# (Free reporting)</p>
                <p><strong>Peace Hub Emergency:</strong> +254 758 284 534</p>
              </div>
            </div>

            <div className="contact-card">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href="https://www.facebook.com/profile.php?id=100094901075386" className="social-link">
                  <FaFacebook /> Facebook
                </a>
                <a href="https://x.com/BobWandati4?t=FjcJ0x017p7UQVWcDZ_zHw&s=09" className="social-link">
                  <FaTwitter /> Twitter
                </a>
                <a href="https://www.linkedin.com/in/bob-wandati-149071333" className="social-link">
                  <FaLinkedin /> LinkedIn
                </a>
              </div>
            </div>
          </div>

          <form id="contactForm" className="contact-form" onSubmit={handleSubmit}>
            <h3>Send us a Message</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactName">Full Name *</label>
                <input
                  type="text"
                  id="contactName"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactEmail">Email *</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactPhone">Phone (Optional)</label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+254 XXX XXX XXX"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactCategory">Category *</label>
                <select
                  id="contactCategory"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="media">Media Request</option>
                  <option value="emergency">Emergency</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contactSubject">Subject *</label>
              <input
                type="text"
                id="contactSubject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                placeholder="Brief subject of your message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactMessage">Message *</label>
              <textarea
                id="contactMessage"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                placeholder="Please provide detailed information about your inquiry..."
                rows="6"
              ></textarea>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="contactNewsletter"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Subscribe to our peace building newsletter
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-large" disabled={isLoading}>
              <FaPaperPlane />
              {isLoading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
