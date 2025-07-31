import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>Dev Utils</h1>
        </div>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <a href="#markdown" className="nav-link active">
            <span className="nav-icon">📝</span>
            Markdown Preview
          </a>
          <a href="#tools" className="nav-link">
            <span className="nav-icon">🛠️</span>
            Tools
          </a>
          <a href="#about" className="nav-link">
            <span className="nav-icon">ℹ️</span>
            About
          </a>
        </div>
        
        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 