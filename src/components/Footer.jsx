import { FaPhone, FaEnvelope, FaMobileAlt, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          
          <div className="footer-section">
            <h3 className="footer-title">Peace Building Hub</h3>
            <p className="footer-text">Empowering communities to build lasting peace through technology and dialogue.</p>
            <div className="footer-social">
              <a href="https://www.facebook.com/profile.php?id=100094901075386"><FaFacebook /></a>
              <a href="https://x.com/BobWandati4?t=FjcJ0x017p7UQVWcDZ_zHw&s=09"><FaTwitter /></a>
              <a href="https://www.linkedin.com/in/bob-wandati-149071333"><FaLinkedin /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Quick Links</h4>
            <a href="/">Home</a>
            <a href="/report">Report Incident</a>
            <a href="#" onClick={() => navigate('/')}>Stories</a>
            <a href="/dialogue">Dialogue</a>
            <a href="/contact">Contact</a>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Emergency</h4>
            <p><FaPhone /> Police: 999 / 112</p>
            <p><FaMobileAlt /> USSD: *456*7#</p>
            <p><FaEnvelope /> emergency@peacehub.ke</p>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Contact</h4>
            <p><FaPhone /> +254 758 284 534</p>
            <p>Bob Wandati - Founder</p>
            <p>Software Engineer, Peace Advocate & Graphics Designer</p>
            <div className="founder-image-wrapper">
              <img
                src="https://github.com/BOBWANDATI/My-Portfolio/blob/main/Snapchat-1702188191~2.jpg?raw=true"
                alt="Founder Bob Wandati"
                className="founder-image"
              />
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 AmaniLink Hub. Building peace through technology.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
