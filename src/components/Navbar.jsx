import { useState } from 'react';
import { FaDove } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../components/styles/Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo-button" onClick={closeMenu}>
          <FaDove className="logo-icon" />
          <span className="logo-text">AmaniLink Hub</span>
        </Link>

        {/* Hamburger */}
        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Menu */}
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li><Link to="/" className="nav-link" onClick={closeMenu}>Home</Link></li>
          <li><a href="/#features" className="nav-link" onClick={closeMenu}>Features</a></li>
          <li><Link to="/report" className="nav-link" onClick={closeMenu}>Report</Link></li>
          <li><Link to="/map" className="nav-link" onClick={closeMenu}>Map</Link></li>
          <li><Link to="/stories" className="nav-link" onClick={closeMenu}>Stories</Link></li>
          <li><Link to="/dialogue" className="nav-link" onClick={closeMenu}>Dialogue</Link></li>
          <li><Link to="/contact" className="nav-link" onClick={closeMenu}>Contact</Link></li>
          <li><Link to="/donate" className="nav-link" onClick={closeMenu}>Donate</Link></li>
          <li><Link to="/news" className="nav-link" onClick={closeMenu}>News</Link></li>
          <li><Link to="/admin" className="btn btn-primary" onClick={closeMenu}>Admin</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
