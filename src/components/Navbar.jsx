import { useState } from 'react';
import { FaDove } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../components/styles/Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

       {/* Logo that links to home */}
       <Link to="/" className="nav-logo-button">
      <FaDove className="logo-icon" />
      <span className="logo-text">AmaniLink Hub</span>
    </Link>




        <div className={`nav-menu ${menuOpen ? 'active' : ''}`} id="navMenu">
          <Link to="/" className="nav-link">Home</Link>
          <a href="/#features" className="nav-link">Features</a> {/* Use anchor for scrolling */}
          <Link to="/report" className="nav-link">Report</Link>
          <Link to="/map" className="nav-link">Map</Link>
          <Link to="/stories" className="nav-link">Stories</Link>
          <Link to="/dialogue" className="nav-link">Dialogue</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/donate" className="nav-link">Donate</Link>
          <Link to="/news" className="nav-link">News</Link> {/* Renamed to '/news' for clarity */}
          <Link to="/admin" className="btn btn-primary">Admin</Link>
        
        </div>

        <div className="hamburger" id="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
