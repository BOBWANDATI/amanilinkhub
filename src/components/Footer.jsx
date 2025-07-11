import { FaPhone, FaEnvelope, FaMobileAlt } from 'react-icons/fa';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          
          <div className="footer-section">
            <h3>Peace Building Hub</h3>
            <p>Empowering communities to build lasting peace through technology and dialogue.</p>
            <div className="footer-social">
              <a href="https://www.facebook.com/profile.php?id=100094901075386"><FaFacebook /></a>
              <a href="https://x.com/BobWandati4?t=FjcJ0x017p7UQVWcDZ_zHw&s=09"><FaTwitter /></a>
              <a href="https://www.linkedin.com/in/bob-wandati-149071333"><FaLinkedin /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="/">Home</a>
            <a href="/report">Report Incident</a>
            <a href="#" onClick={() => navigate('/')}>Stories</a>
            <a href="/dialogue">Dialogue</a>
            <a href="/contact">Contact</a>
          </div>

          <div className="footer-section">
            <h4>Emergency</h4>
            <p><FaPhone /> Police: 999 or 112</p>
            <p><FaMobileAlt /> USSD: *456*7#</p>
            <p><FaEnvelope /> Emergency: emergency@peacehub.ke</p>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p><FaPhone /> +254 758 284 534</p>
            <p>Bob Wandati - Founder</p>
            <p>Software Engineer, Peace Advocate & Graphics Designer</p>

            {/* ✅ Round Image Below Contact */}
            <div className="founder-image-wrapper">
              <img
                src="https://github.com/BOBWANDATI/My-Portfolio/blob/main/Snapchat-1702188191~2.jpg?raw=true" // ✅ Update this to your actual image path
                alt="Founder Bob Wandati"
                className="founder-image"
              />
              <P>VISIT MY PORFOLIO <a href="https://www.canva.com/design/DAGTKVeHNv0/pNnTkwWEuZb9qF9LPBtOgg/view?utm_content=DAGTKVeHNv0&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hf870916921"></a>></P>
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
