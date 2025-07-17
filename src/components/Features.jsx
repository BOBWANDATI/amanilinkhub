import { FaMapPin, FaShieldAlt, FaUsers, FaComments, FaCalendar, FaPhone } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Features.css';

const Features = ({ setShowUSSDModal, setShowSuccessModal }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* About the Hub Section */}
      <section className="about-section">
        
        <div className="about-container">
          
          <div className="about-image animate-pop">
            <img src="https://github.com/BOBWANDATI/My-Portfolio/blob/main/e-diop-AdX3zAKr_jI-unsplash%20(1).jpg?raw=true" alt="Peace Building Hub" />
          </div>
          <div className="about-text">
            <h2 className="about-title">ABOUT AMANILINK HUB</h2>
            <p className="about-description">
            The AmaniLink Hub is a dynamic, community-powered digital platform designed to foster lasting peace through collective action. It brings together citizens, grassroots organizations, peace advocates, and decision-makers to collaborate in identifying, reporting, tracking, and resolving conflicts in real time. By leveraging innovative technologies such as interactive maps, anonymous reporting tools, and live dialogue forums, the platform ensures transparency, inclusivity, and timely intervention.

Our mission is to bridge communication gaps, amplify marginalized voices, and support sustainable peacebuilding efforts across diverse regions. Whether you're a youth leader, community elder, NGO, or simply a concerned citizen, The Peace Building Hub empowers you to be an active part of conflict prevention and resolution. Together, we envision a connected society where peace is not just a goal, but a shared responsibility and everyday reality.


            </p>
          </div>
        </div>
      </section>

      {/* Vision, Mission, What We Do */}
      <section className="intro-section">
        <div className="container">
          <h1 className="section-title">Welcome to Amanilink Hub</h1>

          <div className="vision-mission">
            <div className="intro-card mission">
              <div className="intro-icon"><FaBullseye /></div>
              <h2 className="intro-title">Mission</h2>
              <p className="intro-text">
                To enhance local capacities in conflict resolution by offering innovative reporting tools,
                data-driven insights, and connections with key peace actors at every level.
              </p>
            </div>

            <div className="intro-card vision">
              <div className="intro-icon"><FaLightbulb /></div>
              <h2 className="intro-title">Vision</h2>
              <p className="intro-text">
                To be a trusted platform empowering communities to prevent, manage, and resolve conflicts
                through inclusive digital peacebuilding tools and networks.
              </p>
            </div>

            <div className="intro-card values">
              <div className="intro-icon"><FaBalanceScale /></div>
              <h2 className="intro-title">What We Do</h2>
              <p className="intro-text">
                Amanilink Hub enables individuals and institutions to report incidents, access peace data,
                participate in dialogue, connect with stakeholders, and share testimonies to foster
                understanding and resilience in conflict-affected areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Comprehensive Amanilink Hub Tools</h2>
          <p className="section-subtitle">Everything communities need to prevent, report, and resolve conflicts effectively</p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon blue"><FaMapPin /></div>
              <h3>Incident Reporting</h3>
              <p>Report conflicts anonymously or publicly with location, media, and real-time alerts</p>
              <button className="btn btn-secondary" onClick={() => navigate('/report')}>Try Now</button>
            </div>

            <div className="feature-card">
              <div className="feature-icon green"><FaShieldAlt /></div>
              <h3>Conflict Mapping</h3>
              <p>Interactive maps showing incident patterns, hotspots, and resolution status</p>
              <button className="btn btn-secondary" onClick={() => navigate('/map')}>View Map</button>
            </div>

            <div className="feature-card">
              <div className="feature-icon purple"><FaUsers /></div>
              <h3>Peace Actor Network</h3>
              <p>Connect with NGOs, community leaders, and government peace officers</p>
              <button className="btn btn-secondary" onClick={() => navigate('/contact')}>Connect</button>
            </div>

            <div className="feature-card">
              <div className="feature-icon orange"><FaComments /></div>
              <h3>Dialogue Platform</h3>
              <p>Facilitated discussions between conflicting parties and mediators</p>
              <button className="btn btn-secondary" onClick={() => navigate('/dialogue')}>Join Discussion</button>
            </div>

            <div className="feature-card">
              <div className="feature-icon pink"><FaCalendar /></div>
              <h3>Peace Testimonies</h3>
              <p>Share and read inspiring stories of reconciliation and healing</p>
              <button className="btn btn-secondary" onClick={() => setShowSuccessModal(true)}>Read Stories</button>
            </div>

            <div className="feature-card">
              <div className="feature-icon teal"><FaPhone /></div>
              <h3>USSD Access</h3>
              <p>Report incidents via simple mobile codes - no internet required</p>
              <button className="btn btn-secondary" onClick={() => setShowUSSDModal(true)}>Learn More</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
