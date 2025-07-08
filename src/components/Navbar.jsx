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
        {/* Logo */}
        <Link to="/" className="nav-logo-button">
          <FaDove className="logo-icon" />
          <span className="logo-text">AmaniLink Hub</span>
        </Link>

        {/* Hamburger for mobile */}
        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Menu Links */}
        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <a href="/#features" className="nav-link" onClick={() => setMenuOpen(false)}>Features</a>
          <Link to="/report" className="nav-link" onClick={() => setMenuOpen(false)}>Report</Link>
          <Link to="/map" className="nav-link" onClick={() => setMenuOpen(false)}>Map</Link>
          <Link to="/stories" className="nav-link" onClick={() => setMenuOpen(false)}>Stories</Link>
          <Link to="/dialogue" className="nav-link" onClick={() => setMenuOpen(false)}>Dialogue</Link>
          <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link to="/donate" className="nav-link" onClick={() => setMenuOpen(false)}>Donate</Link>
          <Link to="/news" className="nav-link" onClick={() => setMenuOpen(false)}>News</Link>
          <Link to="/admin" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Admin</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
