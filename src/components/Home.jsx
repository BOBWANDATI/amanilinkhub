import { FaExclamationTriangle, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Home.css';

const Home = ({ setShowTestimonyModal, setShowSuccessModal }) => {
  const navigate = useNavigate();

  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <h1 className="hero-title">BUILDING LASTING PEACE IN COMMNUNITIES</h1>
        <p className="hero-description">
          Report incidents, including gender-based violence, share stories, and connect with peace actors to foster safer, more inclusive, and harmonious communities across the world.
        </p>
        <div className="hero-buttons">
          <button 
            className="btn btn-primary btn-large" 
            onClick={() => navigate('/report')}
          >
            <FaExclamationTriangle />
            Report Incident
          </button>
          <button 
            className="btn btn-secondary btn-large" 
            onClick={() => setShowTestimonyModal(true)}
          >
            <FaHeart />
            Share Your Story
          </button>
        </div>
      </div>
    </section>
  );
};

export default Home;
